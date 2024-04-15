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
exports.ChatController = exports.JoinRoomDto = void 0;
const common_1 = require("@nestjs/common");
const Privatechat_service_1 = require("./services/Privatechat.service");
const userInfo_decorator_1 = require("../utils/decorator/userInfo.decorator");
const auth_guard_1 = require("../utils/guards/auth.guard");
const roomschat_service_1 = require("./services/roomschat.service");
const swagger_1 = require("@nestjs/swagger");
const chat_gateway_service_1 = require("../websockets/chat-gateway/chat-gateway.service");
class JoinRoomDto {
}
exports.JoinRoomDto = JoinRoomDto;
let ChatController = class ChatController {
    constructor(PrivateChatService, roomsChatService, chatGatewayService) {
        this.PrivateChatService = PrivateChatService;
        this.roomsChatService = roomsChatService;
        this.chatGatewayService = chatGatewayService;
    }
    async test(currentuser) {
    }
    async createRoom(currentUserinfo, data) {
        try {
            const res = await this.roomsChatService.leaveOwner(currentUserinfo.sub, data.room_id, data.new_owner_id);
            if (res) {
                return {
                    status: 200,
                    done: true,
                    message: "success",
                };
            }
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                done: false,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async doaction(currentuser, data) {
        const action = data.action;
        const roomId = data.roomId;
        const actionuser_user_id = data.actionuser_user_id;
        try {
            let userSocket = null;
            if (action == 'mute') {
                await this.roomsChatService.muteUserFromRoom(currentuser.sub, roomId, actionuser_user_id, data.time);
            }
            if (action == 'unmute') {
                await this.roomsChatService.UnmuteUserFromRoom(currentuser.sub, roomId, actionuser_user_id);
            }
            if (action == 'ban') {
                await this.roomsChatService.banUserFromRoom(currentuser.sub, roomId, actionuser_user_id);
                userSocket = await this.chatGatewayService.GetUserSocket(actionuser_user_id);
                if (userSocket)
                    userSocket = userSocket.id;
            }
            if (action == 'kick') {
                await this.roomsChatService.kickUserFromRoom(currentuser.sub, roomId, actionuser_user_id);
                userSocket = await this.chatGatewayService.GetUserSocket(actionuser_user_id);
                if (userSocket)
                    userSocket = userSocket.id;
            }
            if (action == 'unban') {
                await this.roomsChatService.UnbanUserFromRoom(currentuser.sub, roomId, actionuser_user_id);
            }
            if (action == 'leave') {
                await this.roomsChatService.leaveRoom(currentuser.sub, roomId, true);
                userSocket = await this.chatGatewayService.GetUserSocket(currentuser.sub);
                if (userSocket)
                    userSocket = userSocket.id;
            }
            if (action == 'SetAdmin') {
                await this.roomsChatService.SetAdminSatatus(currentuser.sub, roomId, actionuser_user_id, 'admin');
            }
            if (action == 'UnsetAdmin') {
                await this.roomsChatService.SetAdminSatatus(currentuser.sub, roomId, actionuser_user_id, 'member');
            }
            if (action == 'DeleteRoom') {
                await this.roomsChatService.deleteRoom(currentuser.sub, roomId);
                userSocket = "room-" + roomId.toString();
            }
            if (userSocket)
                this.chatGatewayService.EmitMessage(userSocket, "MoveUserOut", {});
            this.chatGatewayService.BroadcastMessage("roomUpdated", {});
            this.chatGatewayService.EmitMessage("room-" + roomId.toString(), "roomMembersUpdated", {});
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                canJoin: false,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async inviteFriend(currentuser, data) {
        try {
            const dataRes = await this.roomsChatService.inviteFriendToRoom(currentuser.sub, data.room_id, data.invited_user_id);
            return {
                invited: true,
                message: `${dataRes.user.user_name} has been invited to the room ${dataRes.room.room_name} successfully`,
            };
        }
        catch (e) {
            throw new common_1.HttpException({
                invited: false,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async deleteRoom(currentuser, roomId) {
        try {
            return await this.roomsChatService.deleteRoom(currentuser.sub, roomId);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async getallrooms(currentuser) {
        try {
            return await this.roomsChatService.getRooms(currentuser.sub);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async getroommembers(currentUserinfo, roomId) {
        try {
            return await this.roomsChatService.getRoomMembers(roomId, currentUserinfo.sub);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async createRoomMessage() {
        try {
            return await this.roomsChatService.createRoomMessage(1, 1, "walo");
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async getRoomMessages(currentUserinfo, roomId) {
        try {
            return await this.roomsChatService.getRoomMessages(roomId, currentUserinfo.sub);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async addRoom(currentUserinfo, name, type) {
    }
    async getRoom(room_id) {
        try {
            return await this.roomsChatService.getRoomInfo(room_id);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async joinRoom2(currentUser, data, res) {
        try {
            await this.roomsChatService.JoinRoom(currentUser.sub, data.room_id, data.password, "member");
            this.chatGatewayService.BroadcastMessage("roomUpdated", {});
            this.chatGatewayService.EmitMessage("room-" + data.room_id.toString(), "roomMembersUpdated", {});
            res.send({
                status: 200,
                canJoin: true,
                message: "success",
            });
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                canJoin: false,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async createNewMessage(currentUser, data) {
        try {
            return await this.PrivateChatService.createNewMessage(currentUser.sub, data.receiver_id, data.message_content);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async getMessages(currentUser, friend_id) {
        try {
            return await this.PrivateChatService.getMessages(currentUser.sub, friend_id);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async getCurrentPm(currentUser) {
        try {
            return await this.PrivateChatService.getCurrentUserPm(currentUser.sub);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async DeleteMessage() {
        try {
            return await this.PrivateChatService.DeleteMessage(1);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)("test"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "test", null);
__decorate([
    (0, common_1.Post)("leaveOwner"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Post)("doaction"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "doaction", null);
__decorate([
    (0, common_1.Post)("invitefriend"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "inviteFriend", null);
__decorate([
    (0, common_1.Get)("deleteRoom/:roomId"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("roomId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteRoom", null);
__decorate([
    (0, common_1.Get)("getallrooms"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getallrooms", null);
__decorate([
    (0, common_1.Get)("getroommembers/:roomId"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("roomId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getroommembers", null);
__decorate([
    (0, common_1.Get)("createRoomMessage"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createRoomMessage", null);
__decorate([
    (0, common_1.Get)("getRoomMessages/:roomId"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("roomId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getRoomMessages", null);
__decorate([
    (0, common_1.Get)("addroom/:name/:type"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("name")),
    __param(2, (0, common_1.Param)("type")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addRoom", null);
__decorate([
    (0, common_1.Get)("getroom/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getRoom", null);
__decorate([
    (0, common_1.HttpCode)(201),
    (0, common_1.Post)("joinRoom"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, JoinRoomDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "joinRoom2", null);
__decorate([
    (0, common_1.Post)("createNewMessage"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createNewMessage", null);
__decorate([
    (0, common_1.Get)("get/:id"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Get)("currentPm"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getCurrentPm", null);
__decorate([
    (0, common_1.Get)("deleteMessage"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "DeleteMessage", null);
exports.ChatController = ChatController = __decorate([
    (0, swagger_1.ApiTags)('Chat'),
    (0, common_1.UseGuards)(auth_guard_1.AlreadyLoggedInGuard),
    (0, common_1.Controller)('chat'),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => chat_gateway_service_1.ChatGatewayService))),
    __metadata("design:paramtypes", [Privatechat_service_1.PrivateChatService,
        roomschat_service_1.RoomsChatService,
        chat_gateway_service_1.ChatGatewayService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map