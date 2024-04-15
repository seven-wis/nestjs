import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpException, HttpStatus, UseGuards, Res, Inject, forwardRef, UseFilters } from '@nestjs/common';
import { PrivateChatService } from './services/Privatechat.service';
import { CurrentUser } from 'src/utils/decorator/userInfo.decorator';
import { AlreadyLoggedInGuard } from 'src/utils/guards/auth.guard';
import { RoomsChatService } from './services/roomschat.service';
import { ApiTags } from '@nestjs/swagger';
import { retry } from 'rxjs';
import { ChatGatewayService } from 'src/websockets/chat-gateway/chat-gateway.service';

export interface Message {
    receiver_id: number;
    message_content: string;
}

export class JoinRoomDto {
    room_id: number;
    password: string;
}

@ApiTags('Chat')
@UseGuards(AlreadyLoggedInGuard)
@Controller('chat')
export class ChatController {
    constructor(
        private readonly PrivateChatService: PrivateChatService,
        private readonly roomsChatService: RoomsChatService,
        @Inject(forwardRef(() => ChatGatewayService)) private readonly chatGatewayService: ChatGatewayService,
    ) { }

    @Get("test")
    async test(@CurrentUser() currentuser) {
    }

    @Post("leaveOwner")
    async createRoom(@CurrentUser() currentUserinfo, @Body() data) {
        try {
            const res = await this.roomsChatService.leaveOwner(currentUserinfo.sub, data.room_id, data.new_owner_id);
            if (res) {
                return {
                    status: 200,
                    done: true,
                    message: "success",
                }
            }
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                done: false,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Post("doaction")
    async doaction(@CurrentUser() currentuser, @Body() data) {
        const action = data.action;
        const roomId: number = data.roomId;
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
                    userSocket = userSocket.id
            }
            if (action == 'kick') {
                await this.roomsChatService.kickUserFromRoom(currentuser.sub, roomId, actionuser_user_id);
                userSocket = await this.chatGatewayService.GetUserSocket(actionuser_user_id);
                if (userSocket)
                    userSocket = userSocket.id
            }

            if (action == 'unban') {
                await this.roomsChatService.UnbanUserFromRoom(currentuser.sub, roomId, actionuser_user_id);
            }
            if (action == 'leave') {
                await this.roomsChatService.leaveRoom(currentuser.sub, roomId, true);
                userSocket = await this.chatGatewayService.GetUserSocket(currentuser.sub);
                if (userSocket)
                    userSocket = userSocket.id
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

        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                canJoin: false,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Post("invitefriend")
    async inviteFriend(@CurrentUser() currentuser, @Body() data) {
        try {
            const dataRes = await this.roomsChatService.inviteFriendToRoom(currentuser.sub, data.room_id, data.invited_user_id);
            return {
                invited: true,
                message: `${dataRes.user.user_name} has been invited to the room ${dataRes.room.room_name} successfully`,
            }
        } catch (e) {
            throw new HttpException({
                invited: false,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }
    @Get("deleteRoom/:roomId")
    async deleteRoom(@CurrentUser() currentuser, @Param("roomId") roomId: number) {
        try {
            return await this.roomsChatService.deleteRoom(currentuser.sub, roomId);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("getallrooms")
    async getallrooms(@CurrentUser() currentuser) {
        try {
            return await this.roomsChatService.getRooms(currentuser.sub);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("getroommembers/:roomId")
    async getroommembers(@CurrentUser() currentUserinfo, @Param("roomId") roomId: number) {
        try {
            return await this.roomsChatService.getRoomMembers(roomId, currentUserinfo.sub);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("createRoomMessage")
    async createRoomMessage() {
        try {
            return await this.roomsChatService.createRoomMessage(1, 1, "walo");
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("getRoomMessages/:roomId")
    async getRoomMessages(@CurrentUser() currentUserinfo, @Param("roomId") roomId: number) {
        try {
            return await this.roomsChatService.getRoomMessages(roomId, currentUserinfo.sub);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("addroom/:name/:type")
    async addRoom(@CurrentUser() currentUserinfo, @Param("name") name: string, @Param("type") type: string) {
        // return await this.roomsChatService.createRoom(currentUserinfo.sub, name, type, "123456");
    }

    @Get("getroom/:id")
    async getRoom(@Param("id") room_id: number) {

        try {
            return await this.roomsChatService.getRoomInfo(room_id);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @HttpCode(201)
    @Post("joinRoom")
    async joinRoom2(@CurrentUser() currentUser: any, @Body() data: JoinRoomDto, @Res() res: any) {
        try {
            await this.roomsChatService.JoinRoom(currentUser.sub, data.room_id, data.password, "member");

            // this.chatGatewayService.EmitMessage("chat", "roomUpdated", {});
            this.chatGatewayService.BroadcastMessage("roomUpdated", {});
            this.chatGatewayService.EmitMessage("room-" + data.room_id.toString(), "roomMembersUpdated", {});
            res.send({
                status: 200,
                canJoin: true,
                message: "success",
            });

        } catch (e: any) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                canJoin: false,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Post("createNewMessage")
    async createNewMessage(@CurrentUser() currentUser: any, @Body() data: any) {
        try {
            return await this.PrivateChatService.createNewMessage(currentUser.sub, data.receiver_id, data.message_content);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("get/:id")
    async getMessages(@CurrentUser() currentUser: any, @Param("id") friend_id: number) {
        try {
            return await this.PrivateChatService.getMessages(currentUser.sub, friend_id);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("currentPm")
    async getCurrentPm(@CurrentUser() currentUser: any) {
        try {
            return await this.PrivateChatService.getCurrentUserPm(currentUser.sub);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("deleteMessage")
    async DeleteMessage() {
        try {
            return await this.PrivateChatService.DeleteMessage(1);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }
}
