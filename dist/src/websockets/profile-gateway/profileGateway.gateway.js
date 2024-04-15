"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProfileGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const profileGateway_service_1 = require("./profileGateway.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../../users/services/users.service");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const profile_service_1 = require("../../users/services/profile.service");
const friendreq_service_1 = require("../../users/services/friendreq.service");
const block_service_1 = require("../../users/services/block.service");
const betting_service_1 = require("../../users/services/betting.service");
const Middleware = (jwtService, configService, usersService) => {
    return async (socket, next) => {
        try {
            const cookies = socket.handshake.headers.cookie.split(";").filter((data) => {
                return (data.includes("user_token"));
            });
            const token = cookies[0].trim();
            if (token) {
                const jwtService = new jwt_1.JwtService({
                    secret: configService.get('JWT_SECRET')
                });
                const DecodedToken = jwtService.verify(token.substring(11));
                socket.data.user = DecodedToken;
                next();
            }
            else {
                next(new common_1.UnauthorizedException("123456"));
            }
        }
        catch (e) {
            next(new common_1.UnauthorizedException("123456"));
        }
    };
};
let ProfileGateway = ProfileGateway_1 = class ProfileGateway {
    constructor(profileGatewayService, jwtService, configService, usersService, profileService, friendReqService, blockService, bettingService) {
        this.profileGatewayService = profileGatewayService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.usersService = usersService;
        this.profileService = profileService;
        this.friendReqService = friendReqService;
        this.blockService = blockService;
        this.bettingService = bettingService;
        this.EventActions = new Map();
        this.EventActions.set('send', this.friendReqService.sendFriendRequest.bind(this.friendReqService));
        this.EventActions.set('remove', this.friendReqService.deleteFriend.bind(this.friendReqService));
        this.EventActions.set('accept', this.friendReqService.acceptFriendRequest.bind(this.friendReqService));
        this.EventActions.set('reject', this.friendReqService.rejectFriendRequest.bind(this.friendReqService));
        this.EventActions.set('block', this.blockService.blockfriend.bind(this.blockService));
        this.EventActions.set('unblock', this.blockService.unblockfriend.bind(this.blockService));
    }
    afterInit(client) {
        const middle = Middleware(this.jwtService, this.configService, this.usersService);
        client.use(middle);
    }
    async EmitMessage(target, event, data) {
        console.log("Emitting message to ", target);
        if (target == "all") {
            ProfileGateway_1.ProfileClientsMap.forEach((client) => {
                this.server.emit(event, data);
            });
        }
        else {
            if (ProfileGateway_1.ProfileClientsMap.has(target)) {
                const client = ProfileGateway_1.ProfileClientsMap.get(target);
                console.log("Emitting message to ", target);
                console.log("Event: ", event);
                console.log("Data: ", data);
                this.server.to(client.id).emit(event, data);
            }
        }
    }
    async leaveAllRooms(client) {
        const rooms = client.rooms;
        rooms.forEach((room) => {
            if (room !== client.id)
                client.leave(room);
        });
    }
    async joinRoom(client, room) {
        if (client.data.user.sub.toString() == room) {
        }
        await this.leaveAllRooms(client);
        client.join(room);
    }
    async handleConnection(client, ...args) {
        ProfileGateway_1.ProfileClientsMap.set(client.data.user.sub, client);
        try {
            console.log("Profile User connected : ", client.data.user.sub);
            await this.usersService.update_status(client.data.user.sub, 0);
            await this.profileGatewayService.newAchievementUnlock(client.data.user.sub);
        }
        catch (e) {
            console.log(e.message);
        }
    }
    async handleDisconnect(client) {
        ProfileGateway_1.ProfileClientsMap.delete(client.data.user.sub);
        await this.usersService.update_status(client.data.user.sub, 1);
    }
    async enter_room(client, data) {
        try {
            await this.joinRoom(client, data.room);
            const room = data.room;
            if (room == client.data.user.sub.toString()) {
                const UserProfile = await this.profileService.get_user_profile(client.data.user.sub);
                this.server.to(client.id).emit("friendShipUpdatedProfile", {
                    Profile: UserProfile,
                    event: 'visit'
                });
            }
            else {
                const FriendProfile = await this.profileService.get_user_by_id(client.data.user.sub, parseInt(room));
                this.server.to(client.id).emit("friendShipUpdatedVisit", {
                    friend: FriendProfile,
                    event: 'visit'
                });
            }
        }
        catch (e) {
            console.log(e.message);
        }
    }
    async friend_Ship_event(user_event_sender, user_event_receiver) {
        if (ProfileGateway_1.ProfileClientsMap.has(user_event_sender)) {
            const sender = ProfileGateway_1.ProfileClientsMap.get(user_event_sender);
            this.server.to(sender.id).emit("friendsUpdate", {});
        }
        if (ProfileGateway_1.ProfileClientsMap.has(user_event_receiver)) {
            const receiver = ProfileGateway_1.ProfileClientsMap.get(user_event_receiver);
            this.server.to(receiver.id).emit("friendsUpdate", {});
        }
    }
    async friend_ship_event_emitter(event, current_user_id, friend_id) {
        let client = ProfileGateway_1.ProfileClientsMap.get(current_user_id);
        let sender, receiver;
        try {
            sender = await this.profileService.get_user_by_id(friend_id, current_user_id);
        }
        catch (e) {
            sender = null;
        }
        try {
            receiver = await this.profileService.get_user_by_id(current_user_id, friend_id);
        }
        catch (e) {
            receiver = null;
        }
        if (ProfileGateway_1.ProfileClientsMap.has(friend_id)) {
            const ProfileFriend = await this.profileService.get_user_profile(friend_id);
            const ProfileMe = await this.profileService.get_user_profile(current_user_id);
            const FriendSocket = ProfileGateway_1.ProfileClientsMap.get(friend_id);
            this.server.to(FriendSocket.id).emit("friendShipUpdatedProfile", {
                Profile: ProfileFriend,
                event: event
            });
            if (ProfileGateway_1.ProfileClientsMap.has(current_user_id)) {
                this.server.to(client.id).emit("friendShipUpdatedProfile", {
                    Profile: ProfileMe,
                    event: event
                });
            }
        }
        if (ProfileGateway_1.ProfileClientsMap.has(current_user_id)) {
            const FriendSocket = ProfileGateway_1.ProfileClientsMap.get(current_user_id);
            this.server.to(FriendSocket.id).emit("friendShipUpdatedVisit", { friend: receiver, event: event });
        }
        if (ProfileGateway_1.ProfileClientsMap.has(friend_id)) {
            if (ProfileGateway_1.ProfileClientsMap.get(friend_id).rooms.has(current_user_id.toString())) {
                const FriendSocket = ProfileGateway_1.ProfileClientsMap.get(friend_id);
                this.server.to(FriendSocket.id).emit("friendShipUpdatedVisit", { friend: sender, event: event });
            }
        }
        return;
    }
    async friend_ship_event(client, data) {
        const current_user_id = client.data.user.sub;
        const friend_id = data.Friend_id;
        const event = data.Event;
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
    async notification_update(user_target_id) {
        if (ProfileGateway_1.ProfileClientsMap.has(user_target_id)) {
            const user_targe_socket = ProfileGateway_1.ProfileClientsMap.get(user_target_id);
            this.server.to(user_targe_socket.id).emit("notification_update", {
                notification: true
            });
        }
    }
    async invite_to_play(client, data) {
        const current_user_id = client.data.user.sub;
        const friend_id = data.Friend_id;
        if (ProfileGateway_1.ProfileClientsMap.has(friend_id)) {
            const friend_socket = ProfileGateway_1.ProfileClientsMap.get(friend_id);
            this.server.to(friend_socket.id).emit("invite_to_play", {
                Friend_id: current_user_id,
                Message: `You have been invited to play a game by ${client.data.user.username}`
            });
        }
    }
    async newBetter(client, data) {
        const betObj = {
            current_user_id: client.data.user.sub,
            gameId: data.matchId,
            bettingValue: data.amount,
            betOn: data.betOn,
        };
        this.profileGatewayService.game_betting(betObj);
    }
};
exports.ProfileGateway = ProfileGateway;
ProfileGateway.ProfileClientsMap = new Map();
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ProfileGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('profile_navigation'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ProfileGateway.prototype, "enter_room", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('friend_ship_event'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ProfileGateway.prototype, "friend_ship_event", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('invite_to_play'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ProfileGateway.prototype, "invite_to_play", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('newBetter'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ProfileGateway.prototype, "newBetter", null);
exports.ProfileGateway = ProfileGateway = ProfileGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: "/profile",
        cors: {
            origin: true,
            credentials: true
        }
    }),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => profileGateway_service_1.ProfileGatewayService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => profile_service_1.ProfileService))),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => friendreq_service_1.FriendReqService))),
    __param(6, (0, common_1.Inject)((0, common_1.forwardRef)(() => block_service_1.BlockService))),
    __param(7, (0, common_1.Inject)((0, common_1.forwardRef)(() => betting_service_1.BettingService))),
    __metadata("design:paramtypes", [profileGateway_service_1.ProfileGatewayService,
        jwt_1.JwtService,
        config_1.ConfigService,
        users_service_1.UsersService,
        profile_service_1.ProfileService,
        friendreq_service_1.FriendReqService,
        block_service_1.BlockService,
        betting_service_1.BettingService])
], ProfileGateway);
//# sourceMappingURL=profileGateway.gateway.js.map