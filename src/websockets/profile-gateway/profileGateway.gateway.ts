import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ProfileGatewayService } from './profileGateway.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/services/users.service';
import { Server, Socket } from 'socket.io';
import { Inject, UnauthorizedException, UseFilters, UseGuards, forwardRef } from '@nestjs/common';
import { ProfileService } from 'src/users/services/profile.service';
import { FriendReqService } from 'src/users/services/friendreq.service';
import { BlockService } from 'src/users/services/block.service';
import { UserDto } from 'src/utils/dto';
import { Friendship } from 'src/users/entities';
import { AlreadyLoggedInGuard } from 'src/utils/guards/auth.guard';
import { GameBettingRepository } from 'src/utils/repositories/gamebetting.repository';
import { BettingService } from 'src/users/services/betting.service';

export type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void

const Middleware = (jwtService: JwtService, configService: ConfigService, usersService: UsersService) => {
	return async (socket: Socket, next) => {


		try {
			const cookies = socket.handshake.headers.cookie.split(";").filter((data) => {
				return (data.includes("user_token"));
			});

			const token = cookies[0].trim();

			if (token) {
				const jwtService = new JwtService({
					secret: configService.get<string>('JWT_SECRET')
				});

				const DecodedToken = jwtService.verify(token.substring(11));
				socket.data.user = DecodedToken;
				next();
			} else {
				next(new UnauthorizedException("123456"));
			}
		} catch (e) {
			next(new UnauthorizedException("123456"));
		}
	}
}

@WebSocketGateway({
	namespace: "/profile",
	cors: {
		origin: true, // [process.env.FRONTEND_URL],
		credentials: true
	}
})

export class ProfileGateway {
	private EventActions: Map<string, (currentUserId: number, friendId: number) => Promise<Friendship>> = new Map();
	constructor(
		// private readonly profileGatewayService: ProfileGatewayService,
		@Inject(forwardRef(() => ProfileGatewayService)) private readonly profileGatewayService: ProfileGatewayService,

		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		// private readonly usersService: UsersService,
		// private readonly profileService: ProfileService,
        @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,

		@Inject(forwardRef(() => ProfileService)) private readonly profileService: ProfileService,

		@Inject(forwardRef(() => FriendReqService)) private readonly friendReqService: FriendReqService,
		@Inject(forwardRef(() => BlockService)) private readonly blockService: BlockService,
		@Inject(forwardRef(() => BettingService)) private readonly bettingService: BettingService,

		// private readonly blockService: BlockService
	) {
		this.EventActions.set('send', this.friendReqService.sendFriendRequest.bind(this.friendReqService));
		this.EventActions.set('remove', this.friendReqService.deleteFriend.bind(this.friendReqService));
		this.EventActions.set('accept', this.friendReqService.acceptFriendRequest.bind(this.friendReqService))
		this.EventActions.set('reject', this.friendReqService.rejectFriendRequest.bind(this.friendReqService))
		this.EventActions.set('block', this.blockService.blockfriend.bind(this.blockService));
		this.EventActions.set('unblock', this.blockService.unblockfriend.bind(this.blockService));
	}

	@WebSocketServer()
	private server: Server;
	private static ProfileClientsMap = new Map<number, Socket>();

	afterInit(client: Socket) {
		const middle = Middleware(this.jwtService, this.configService, this.usersService);
		client.use(middle as any);
	}

	async EmitMessage(target: any, event: string, data: any) {
		console.log("Emitting message to ", target);

		if (target == "all") {
			ProfileGateway.ProfileClientsMap.forEach((client) => {
				this.server.emit(event, data);
			});
		} else {
			if (ProfileGateway.ProfileClientsMap.has(target)) {
				const client = ProfileGateway.ProfileClientsMap.get(target);
				console .log("Emitting message to ", target);
				console.log("Event: ", event);
				console.log("Data: ", data);

				this.server.to(client.id).emit(event, data);
			}
		}
	}

	async leaveAllRooms(client: Socket) {
		const rooms = client.rooms;
		rooms.forEach((room) => {
			if (room !== client.id)
				client.leave(room);
		});
	}

	async joinRoom(client: Socket, room: string) {
		if (client.data.user.sub.toString() == room) {
			// this.profileGatewayService.
		}
		await this.leaveAllRooms(client);
		client.join(room);
	}

	async handleConnection(client: any, ...args: any[]) {
		ProfileGateway.ProfileClientsMap.set(client.data.user.sub, client);
		try {
			console.log("Profile User connected : ", client.data.user.sub);
			await this.usersService.update_status(client.data.user.sub, 0);
			await this.profileGatewayService.newAchievementUnlock(client.data.user.sub);
		} catch (e) {
			console.log(e.message);
		}

	}

	async handleDisconnect(client: any) {
		ProfileGateway.ProfileClientsMap.delete(client.data.user.sub);
		await this.usersService.update_status(client.data.user.sub, 1);
	}

	@SubscribeMessage('profile_navigation')
	async enter_room(client: Socket, data: any) {
		try {
			await this.joinRoom(client, data.room);

			const room: string = data.room as string;
			if (room == client.data.user.sub.toString()) {
				const UserProfile = await this.profileService.get_user_profile(client.data.user.sub);
				this.server.to(client.id).emit("friendShipUpdatedProfile", {
					Profile: UserProfile,
					event: 'visit'
				});
			} else {
				const FriendProfile = await this.profileService.get_user_by_id(client.data.user.sub, parseInt(room));
				this.server.to(client.id).emit("friendShipUpdatedVisit", {
					friend: FriendProfile,
					event: 'visit'
				});
			}
		} catch (e) {
			console.log(e.message);
		}
	}

	async friend_Ship_event(user_event_sender: number, user_event_receiver: number) {
		if (ProfileGateway.ProfileClientsMap.has(user_event_sender)) {
			const sender = ProfileGateway.ProfileClientsMap.get(user_event_sender);
			this.server.to(sender.id).emit("friendsUpdate", {});
		}
		if (ProfileGateway.ProfileClientsMap.has(user_event_receiver)) {
			const receiver = ProfileGateway.ProfileClientsMap.get(user_event_receiver);
			this.server.to(receiver.id).emit("friendsUpdate", {});
		}
	}

	async friend_ship_event_emitter(event: string, current_user_id: number, friend_id: number) {
		let client = ProfileGateway.ProfileClientsMap.get(current_user_id);
		let sender: UserDto, receiver: UserDto;
		try {
			sender = await this.profileService.get_user_by_id(friend_id, current_user_id);
		} catch (e) {
			sender = null;
		}
		try {
			receiver = await this.profileService.get_user_by_id(current_user_id, friend_id);
		} catch (e) {
			receiver = null;
		}

		if (ProfileGateway.ProfileClientsMap.has(friend_id)) {
			const ProfileFriend = await this.profileService.get_user_profile(friend_id);
			const ProfileMe = await this.profileService.get_user_profile(current_user_id);
			const FriendSocket = ProfileGateway.ProfileClientsMap.get(friend_id);
			this.server.to(FriendSocket.id).emit("friendShipUpdatedProfile", {
				Profile: ProfileFriend,
				event: event
			});

			if (ProfileGateway.ProfileClientsMap.has(current_user_id)) {
				this.server.to(client.id).emit("friendShipUpdatedProfile", {
					Profile: ProfileMe,
					event: event
				});
			}
		}

		if (ProfileGateway.ProfileClientsMap.has(current_user_id)) {
			const FriendSocket = ProfileGateway.ProfileClientsMap.get(current_user_id);
			this.server.to(FriendSocket.id).emit("friendShipUpdatedVisit", { friend: receiver, event: event });
		}

		if (ProfileGateway.ProfileClientsMap.has(friend_id)) {
			if (ProfileGateway.ProfileClientsMap.get(friend_id).rooms.has(current_user_id.toString())) {
				const FriendSocket = ProfileGateway.ProfileClientsMap.get(friend_id);
				this.server.to(FriendSocket.id).emit("friendShipUpdatedVisit", { friend: sender, event: event });
			}
		}

		return;
	}

	@SubscribeMessage('friend_ship_event')
	async friend_ship_event(client: Socket, data: any) {
		const current_user_id: number = client.data.user.sub;
		const friend_id: number = data.Friend_id;
		const event: string = data.Event;

		try {
			let result = await this.EventActions.get(event)(current_user_id, friend_id);
			if (result) {
				this.friend_ship_event_emitter(event, current_user_id, friend_id);
				return;
			}
			throw new Error("Recource not found");
		}
		catch (e) {

			this.server.to(client.id).emit("ErrorAction", {
				event: event,
				error: e.message
			});
		}
	}


	async notification_update(user_target_id: number) {
		if (ProfileGateway.ProfileClientsMap.has(user_target_id)) {
			const user_targe_socket = ProfileGateway.ProfileClientsMap.get(user_target_id);
			this.server.to(user_targe_socket.id).emit("notification_update", {
				notification: true
			});
		}
	}

	// invite to play
	@SubscribeMessage('invite_to_play')
	async invite_to_play(client: Socket, data: any) {

		const current_user_id: number = client.data.user.sub;
		const friend_id: number = data.Friend_id;

		if (ProfileGateway.ProfileClientsMap.has(friend_id)) {
			const friend_socket = ProfileGateway.ProfileClientsMap.get(friend_id);
			this.server.to(friend_socket.id).emit("invite_to_play", {
				Friend_id: current_user_id,
				Message: `You have been invited to play a game by ${client.data.user.username}`
			});
		}
	}


	/*************************Game Betting *****************************/
	@SubscribeMessage('newBetter')
	async newBetter(client: Socket, data: any) {
		const betObj = {
			current_user_id: client.data.user.sub,
			gameId: data.matchId,
			bettingValue: data.amount,
			betOn: data.betOn,
		}

		this.profileGatewayService.game_betting(betObj);
	}

}
