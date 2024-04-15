import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatGatewayService } from './chat-gateway.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/services/users.service';
import { Server, Socket } from 'socket.io';
import { Inject, UnauthorizedException, UseFilters, forwardRef } from '@nestjs/common';
import { PrivateChatService } from 'src/chat/services/Privatechat.service';
import { measureMemory } from 'vm';
import { ProfileService } from 'src/users/services/profile.service';
import { emit } from 'process';
import { first } from 'rxjs';
import { RoomsChatService } from 'src/chat/services/roomschat.service';
import { ChannelType } from 'src/utils/dto';

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
                // const user = await usersService.user_data(DecodedToken.sub);
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
    namespace: "/chat",
    cors: {
        origin: true, // [process.env.FRONTEND_URL],
        credentials: true
    }
})
export class ChatGateway {
    constructor(
        @Inject(forwardRef(() => ChatGatewayService)) private readonly chatGatewayService: ChatGatewayService,
        @Inject(forwardRef(() => JwtService)) private readonly jwtService: JwtService,
        @Inject(forwardRef(() => ConfigService)) private readonly configService: ConfigService,
        @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
        @Inject(forwardRef(() => PrivateChatService)) private readonly PrivateChatService: PrivateChatService,
        @Inject(forwardRef(() => ProfileService)) private readonly profileService: ProfileService,
        @Inject(forwardRef(() => RoomsChatService)) private readonly roomsChatService: RoomsChatService
    ) { }

    @WebSocketServer()
    private server: Server;
    private static ChatClientsMap = new Map<number, Socket>();

    afterInit(client: Socket) {
        const middle = Middleware(this.jwtService, this.configService, this.usersService);
        client.use(middle as any);
    }

    handleConnection(client: any, ...args: any[]) {

        ChatGateway.ChatClientsMap.set(client.data.user.sub, client);
        console.log("Chat User connected : ", client.data.user.sub);
        try {
            this.usersService.update_status(client.data.user.sub, 0);
        }
        catch (e) {
            console.log("Error : ", e.message);
        }
    }

    handleDisconnect(client: any) {
        ChatGateway.ChatClientsMap.delete(client.data.user.sub);
        this.usersService.update_status(client.data.user.sub, 1);
    }

    async EmitMessage(target: any, event: string, data: any) {
        this.server.to(target).emit(event, data);
    }

    async BroadcastMessage(event: string, data: any) {
        ChatGateway.ChatClientsMap.forEach((client) => {
            client.emit(event, data);
        });
    }

    async GetUserSocketId(userId: number): Promise<Socket> | null {
        if (ChatGateway.ChatClientsMap.has(userId)) {
            return ChatGateway.ChatClientsMap.get(userId);
        }
        return null;
    }

    async leaveAllRooms(client: Socket) {
        const rooms = client.rooms;
        rooms.forEach((room) => {
            if (room !== client.id && room != 'chat') {
                client.leave(room);
            }
        });
    }

    async joinRoom(client: Socket, room: string) {
        await this.leaveAllRooms(client);
        client.join(room);
    }

    @SubscribeMessage('leavePm')
    async handleLeavePm(client: any, data: any) {
        this.leaveAllRooms(client);
    }

    @SubscribeMessage('joinPm')
    async handleJoinPm(client: any, data: any) {
        try {
            this.PrivateChatService.markAsRead(client.data.user.sub, data.FrindId);
        } catch (e) {
        }
        this.joinRoom(client, data.PmToken);
    }

    @SubscribeMessage('newPrivateMessage')
    async handleMessage(client: any, data: any) {
        const UserPm = await this.PrivateChatService.getCurrentUserPm(client.data.user.sub);
        const PmRoomToken = data.PmToken;
        try {
            const message = await this.PrivateChatService.createNewMessage(client.data.user.sub, data.ReceiverId, data.message);
            if (message) {
                if (ChatGateway.ChatClientsMap.has(client.data.user.sub)) {
                    this.server.to(client.id).emit('receivePrivateMsg', {
                        messageDto: message,
                        userId: data.ReceiverId,
                    });
                    if (UserPm.find((user) => user.friendShipToken === data.PmToken) === undefined) {
                        const friend = await this.profileService.get_user_by_id(client.data.user.sub, data.ReceiverId);
                        const friendPm = {
                            id: friend.id,
                            name: friend.name,
                            currentAvatar: friend.currentAvatar,
                            status: friend.status,
                            friendShipToken: friend.friendShipToken
                        }
                        this.server.to(client.id).emit('newPMuser', {
                            data: friendPm
                        });
                    }
                }

                if (ChatGateway.ChatClientsMap.has(data.ReceiverId)) {
                    if (UserPm.find((user) => user.friendShipToken === data.PmToken) === undefined) {
                        const friend = await this.profileService.get_user_by_id(data.ReceiverId, client.data.user.sub);
                        const friendPm = {
                            id: friend.id,
                            name: friend.name,
                            currentAvatar: friend.currentAvatar,
                            status: friend.status,
                            friendShipToken: friend.friendShipToken,
                            messageCount: await this.PrivateChatService.getMessageCount(data.ReceiverId, client.data.user.sub),
                            TimeOfLastmessage: new Date().toISOString(),
                        }

                        this.server.to(ChatGateway.ChatClientsMap.get(data.ReceiverId).id).emit('newPMuser', {
                            data: friendPm
                        });
                    }
                    if (ChatGateway.ChatClientsMap.get(data.ReceiverId).rooms.has(PmRoomToken)) {
                        this.PrivateChatService.markAsRead(data.ReceiverId, client.data.user.sub);
                        this.server.to(ChatGateway.ChatClientsMap.get(data.ReceiverId).id).emit('receivePrivateMsg', {
                            messageDto: message,
                            userId: client.data.user.sub
                        });
                    }
                    else {
                        this.server.to(ChatGateway.ChatClientsMap.get(data.ReceiverId).id).emit('newUnreadMessage', {
                            SenderId: client.data.user.sub,
                            time: message.fullTime,
                        });
                    }
                }
            }
        } catch (e) {
            this.server.to(client.id).emit('ErrorAction', { error: e.message });
        }
    }

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(client: any, data: any) {
        console.log(`Joining room ${data.room} by ${client.data.user.username}`);
        this.joinRoom(client, data.room);
    }

    @SubscribeMessage('createMessageRoom')
    async handleCreateMessageRoom(client: Socket, RoomData: any) {
        try {
            RoomData.current_user_id = client.data.user.sub;
            const newRoom = await this.chatGatewayService.CreateRoom(RoomData)
            if (newRoom.status == 200) {
                if (newRoom.data.ChannelType != ChannelType.privateChannel) {
                    this.server.to('chat').emit('newRoomCreated', {
                        newRoom: newRoom.data,
                    });
                } else {
                    this.server.to(client.id).emit('newRoomCreated', {
                        newRoom: newRoom.data,
                    });
                }
            } else {
            }
        } catch (e) {
            this.server.to(client.id).emit('ErrorAction', { error: e.message });
        }
    }

    @SubscribeMessage('NewRoomMessage')
    async handleNewRoomMessage(client: Socket, data: any) {
        try {

            await this.chatGatewayService.CreateRoomMessage({
                roomId: data.roomId,
                userId: client.data.user.sub,
                message: data.message,
            });


        } catch (e) {
            this.server.to(client.id).emit('ErrorAction', { error: e.message });
        }
    }

    @SubscribeMessage('updateRoom')
    async handleUpdateRoom(client: Socket, RoomData: any) {

        try {
            RoomData.current_user_id = client.data.user.sub;
            const room = await this.chatGatewayService.updateRoomInfo(RoomData);
            this.server.to('chat').emit('roomUpdated');
        } catch (e) {
            this.server.to(client.id).emit('ErrorAction', { error: e.message });
        }
    }
}