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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGatewayService = void 0;
const common_1 = require("@nestjs/common");
const Privatechat_service_1 = require("../../chat/services/Privatechat.service");
const roomschat_service_1 = require("../../chat/services/roomschat.service");
const profile_service_1 = require("../../users/services/profile.service");
const dto_1 = require("../../utils/dto");
const chat_gateway_gateway_1 = require("./chat-gateway.gateway");
let ChatGatewayService = class ChatGatewayService {
    constructor(privateChatService, roomsChatService, profileService, chatGateway) {
        this.privateChatService = privateChatService;
        this.roomsChatService = roomsChatService;
        this.profileService = profileService;
        this.chatGateway = chatGateway;
    }
    async CreateRoom(RoomData) {
        try {
            const roomInfo = {
                current_user_id: RoomData.current_user_id,
                roomName: RoomData.roomName,
                roomType: (RoomData.ChannelType == dto_1.ChannelType.publicChannel) ? 'public' : (RoomData.ChannelType == dto_1.ChannelType.privateChannel) ? 'private' : 'protected',
                roomPassword: RoomData.password,
            };
            const newRoom = await this.roomsChatService.createRoom(roomInfo);
            if (newRoom) {
                return {
                    status: 200,
                    message: "Room Created Successfully",
                    data: newRoom
                };
            }
        }
        catch (e) {
            return {
                status: 500,
                message: e
            };
        }
    }
    async updateRoomInfo(RoomData) {
        const roomInfo = {
            roomId: RoomData.roomId,
            current_user_id: RoomData.current_user_id,
            roomName: RoomData.roomName,
            roomType: (RoomData.ChannelType == dto_1.ChannelType.publicChannel) ? 'public' : (RoomData.ChannelType == dto_1.ChannelType.privateChannel) ? 'private' : 'protected',
            roomPassword: RoomData.password,
        };
        const updatedRoom = await this.roomsChatService.updateRoomInfo(roomInfo);
        if (updatedRoom) {
            return {
                status: 200,
                message: "Room Updated Successfully",
                data: updatedRoom
            };
        }
        else {
            return {
                status: 500,
                message: "Room not updated"
            };
        }
    }
    async CreateRoomMessage(messageBody) {
        const message = await this.roomsChatService.createRoomMessage(messageBody.roomId, messageBody.userId, messageBody.message);
        if (message) {
            const roomUsers = (await this.roomsChatService.getRoomInfo(messageBody.roomId)).users;
            roomUsers.forEach(async (user) => {
                const socket = await this.GetUserSocket(user.user_id);
                if (socket) {
                    if (socket.rooms.has(String("room-" + messageBody.roomId.toString()))) {
                        this.chatGateway.EmitMessage(socket.id, "receiveRoomMsg", {
                            message: message,
                            roomId: messageBody.roomId,
                        });
                    }
                    else if (socket.rooms.has('chat')) {
                        this.chatGateway.EmitMessage(socket.id, "unreadRoomMessages", {
                            time: message.fullTime,
                            roomId: messageBody.roomId,
                        });
                        await this.roomsChatService.updateUserRef_number_of_unread_messages(user.user_id, messageBody.roomId);
                    }
                }
            });
        }
        else
            throw new Error("Error : message not sent");
    }
    async EmitMessage(target, event, data) {
        this.chatGateway.EmitMessage(target, event, data);
    }
    async BroadcastMessage(event, data) {
        this.chatGateway.BroadcastMessage(event, data);
    }
    async GetUserSocket(userId) {
        return this.chatGateway.GetUserSocketId(userId);
    }
};
exports.ChatGatewayService = ChatGatewayService;
exports.ChatGatewayService = ChatGatewayService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => roomschat_service_1.RoomsChatService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => profile_service_1.ProfileService))),
    __metadata("design:paramtypes", [Privatechat_service_1.PrivateChatService,
        roomschat_service_1.RoomsChatService,
        profile_service_1.ProfileService,
        chat_gateway_gateway_1.ChatGateway])
], ChatGatewayService);
//# sourceMappingURL=chat-gateway.service.js.map