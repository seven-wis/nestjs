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
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const chat_gateway_service_1 = require("./chat-gateway.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../../users/services/users.service");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const Privatechat_service_1 = require("../../chat/services/Privatechat.service");
const profile_service_1 = require("../../users/services/profile.service");
const roomschat_service_1 = require("../../chat/services/roomschat.service");
const dto_1 = require("../../utils/dto");
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
let ChatGateway = ChatGateway_1 = class ChatGateway {
    constructor(chatGatewayService, jwtService, configService, usersService, PrivateChatService, profileService, roomsChatService) {
        this.chatGatewayService = chatGatewayService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.usersService = usersService;
        this.PrivateChatService = PrivateChatService;
        this.profileService = profileService;
        this.roomsChatService = roomsChatService;
    }
    afterInit(client) {
        const middle = Middleware(this.jwtService, this.configService, this.usersService);
        client.use(middle);
    }
    handleConnection(client, ...args) {
        ChatGateway_1.ChatClientsMap.set(client.data.user.sub, client);
        console.log("Chat User connected : ", client.data.user.sub);
        try {
            this.usersService.update_status(client.data.user.sub, 0);
        }
        catch (e) {
            console.log("Error : ", e.message);
        }
    }
    handleDisconnect(client) {
        ChatGateway_1.ChatClientsMap.delete(client.data.user.sub);
        this.usersService.update_status(client.data.user.sub, 1);
    }
    async EmitMessage(target, event, data) {
        this.server.to(target).emit(event, data);
    }
    async BroadcastMessage(event, data) {
        ChatGateway_1.ChatClientsMap.forEach((client) => {
            client.emit(event, data);
        });
    }
    async GetUserSocketId(userId) {
        if (ChatGateway_1.ChatClientsMap.has(userId)) {
            return ChatGateway_1.ChatClientsMap.get(userId);
        }
        return null;
    }
    async leaveAllRooms(client) {
        const rooms = client.rooms;
        rooms.forEach((room) => {
            if (room !== client.id && room != 'chat') {
                client.leave(room);
            }
        });
    }
    async joinRoom(client, room) {
        await this.leaveAllRooms(client);
        client.join(room);
    }
    async handleLeavePm(client, data) {
        this.leaveAllRooms(client);
    }
    async handleJoinPm(client, data) {
        try {
            this.PrivateChatService.markAsRead(client.data.user.sub, data.FrindId);
        }
        catch (e) {
        }
        this.joinRoom(client, data.PmToken);
    }
    async handleMessage(client, data) {
        const UserPm = await this.PrivateChatService.getCurrentUserPm(client.data.user.sub);
        const PmRoomToken = data.PmToken;
        try {
            const message = await this.PrivateChatService.createNewMessage(client.data.user.sub, data.ReceiverId, data.message);
            if (message) {
                if (ChatGateway_1.ChatClientsMap.has(client.data.user.sub)) {
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
                        };
                        this.server.to(client.id).emit('newPMuser', {
                            data: friendPm
                        });
                    }
                }
                if (ChatGateway_1.ChatClientsMap.has(data.ReceiverId)) {
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
                        };
                        this.server.to(ChatGateway_1.ChatClientsMap.get(data.ReceiverId).id).emit('newPMuser', {
                            data: friendPm
                        });
                    }
                    if (ChatGateway_1.ChatClientsMap.get(data.ReceiverId).rooms.has(PmRoomToken)) {
                        this.PrivateChatService.markAsRead(data.ReceiverId, client.data.user.sub);
                        this.server.to(ChatGateway_1.ChatClientsMap.get(data.ReceiverId).id).emit('receivePrivateMsg', {
                            messageDto: message,
                            userId: client.data.user.sub
                        });
                    }
                    else {
                        this.server.to(ChatGateway_1.ChatClientsMap.get(data.ReceiverId).id).emit('newUnreadMessage', {
                            SenderId: client.data.user.sub,
                            time: message.fullTime,
                        });
                    }
                }
            }
        }
        catch (e) {
            this.server.to(client.id).emit('ErrorAction', { error: e.message });
        }
    }
    async handleJoinRoom(client, data) {
        console.log(`Joining room ${data.room} by ${client.data.user.username}`);
        this.joinRoom(client, data.room);
    }
    async handleCreateMessageRoom(client, RoomData) {
        try {
            RoomData.current_user_id = client.data.user.sub;
            const newRoom = await this.chatGatewayService.CreateRoom(RoomData);
            if (newRoom.status == 200) {
                if (newRoom.data.ChannelType != dto_1.ChannelType.privateChannel) {
                    this.server.to('chat').emit('newRoomCreated', {
                        newRoom: newRoom.data,
                    });
                }
                else {
                    this.server.to(client.id).emit('newRoomCreated', {
                        newRoom: newRoom.data,
                    });
                }
            }
            else {
            }
        }
        catch (e) {
            this.server.to(client.id).emit('ErrorAction', { error: e.message });
        }
    }
    async handleNewRoomMessage(client, data) {
        try {
            await this.chatGatewayService.CreateRoomMessage({
                roomId: data.roomId,
                userId: client.data.user.sub,
                message: data.message,
            });
        }
        catch (e) {
            this.server.to(client.id).emit('ErrorAction', { error: e.message });
        }
    }
    async handleUpdateRoom(client, RoomData) {
        try {
            RoomData.current_user_id = client.data.user.sub;
            const room = await this.chatGatewayService.updateRoomInfo(RoomData);
            this.server.to('chat').emit('roomUpdated');
        }
        catch (e) {
            this.server.to(client.id).emit('ErrorAction', { error: e.message });
        }
    }
};
exports.ChatGateway = ChatGateway;
ChatGateway.ChatClientsMap = new Map();
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('leavePm'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeavePm", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinPm'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinPm", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('newPrivateMessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('createMessageRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleCreateMessageRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('NewRoomMessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleNewRoomMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('updateRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleUpdateRoom", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: "/chat",
        cors: {
            origin: true,
            credentials: true
        }
    }),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => chat_gateway_service_1.ChatGatewayService))),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => jwt_1.JwtService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => config_1.ConfigService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => Privatechat_service_1.PrivateChatService))),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => profile_service_1.ProfileService))),
    __param(6, (0, common_1.Inject)((0, common_1.forwardRef)(() => roomschat_service_1.RoomsChatService))),
    __metadata("design:paramtypes", [chat_gateway_service_1.ChatGatewayService,
        jwt_1.JwtService,
        config_1.ConfigService,
        users_service_1.UsersService,
        Privatechat_service_1.PrivateChatService,
        profile_service_1.ProfileService,
        roomschat_service_1.RoomsChatService])
], ChatGateway);
//# sourceMappingURL=chat-gateway.gateway.js.map