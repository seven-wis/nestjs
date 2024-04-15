import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PrivateChatService } from 'src/chat/services/Privatechat.service';
import { RoomsChatService } from 'src/chat/services/roomschat.service';
import { ProfileService } from 'src/users/services/profile.service';
import { ChannelType, RoomInfo } from 'src/utils/dto';
import { ChatGateway } from './chat-gateway.gateway';


@Injectable()
export class ChatGatewayService {
    constructor(
        private readonly privateChatService: PrivateChatService,
        @Inject(forwardRef(() => RoomsChatService)) private readonly roomsChatService: RoomsChatService,
        // private readonly profileService: ProfileService,
        @Inject(forwardRef(() => ProfileService)) private readonly profileService: ProfileService,

        private chatGateway: ChatGateway
    ) { }

    async CreateRoom(RoomData: any) {
        try {
            const roomInfo: RoomInfo = {
                current_user_id: RoomData.current_user_id,
                roomName: RoomData.roomName,
                roomType: (RoomData.ChannelType == ChannelType.publicChannel) ? 'public' : (RoomData.ChannelType == ChannelType.privateChannel) ? 'private' : 'protected',
                roomPassword: RoomData.password,
            }

            const newRoom = await this.roomsChatService.createRoom(roomInfo);
            if (newRoom) {
                return {
                    status: 200,
                    message: "Room Created Successfully",
                    data: newRoom
                }
            }
        } catch (e) {
            return {
                status: 500,
                message: e
            }
        }
    }

    async updateRoomInfo(RoomData: any) {
        const roomInfo: RoomInfo = {
            roomId: RoomData.roomId,
            current_user_id: RoomData.current_user_id,
            roomName: RoomData.roomName,
            roomType: (RoomData.ChannelType == ChannelType.publicChannel) ? 'public' : (RoomData.ChannelType == ChannelType.privateChannel) ? 'private' : 'protected',
            roomPassword: RoomData.password,
        }

        const updatedRoom = await this.roomsChatService.updateRoomInfo(roomInfo);

        if (updatedRoom) {
            return {
                status: 200,
                message: "Room Updated Successfully",
                data: updatedRoom
            }
        } else {
            return {
                status: 500,
                message: "Room not updated"
            }
        }
    }

    async CreateRoomMessage(messageBody: any): Promise<void> {
        const message = await this.roomsChatService.createRoomMessage(messageBody.roomId, messageBody.userId, messageBody.message);
        if (message) {
            const roomUsers = (await this.roomsChatService.getRoomInfo(messageBody.roomId)).users;
            

            
            roomUsers.forEach(async (user) => {
                const socket: Socket = await this.GetUserSocket(user.user_id);
                if (socket) {
                    if (socket.rooms.has(String("room-" + messageBody.roomId.toString()))) {
                        this.chatGateway.EmitMessage(socket.id, "receiveRoomMsg", {
                            message: message,
                            roomId: messageBody.roomId,
                        });
                    } else if (socket.rooms.has('chat')) {
                        this.chatGateway.EmitMessage(socket.id, "unreadRoomMessages", {
                            time: message.fullTime,
                            roomId: messageBody.roomId,
                        });
                        await this.roomsChatService.updateUserRef_number_of_unread_messages(user.user_id, messageBody.roomId);
                    }
                }
            });
        } else
            throw new Error("Error : message not sent");
    }

    async EmitMessage(target: any, event: string, data: any) {
        this.chatGateway.EmitMessage(target, event, data);
    }

    async BroadcastMessage(event: string, data: any) {
        this.chatGateway.BroadcastMessage(event, data);
    }
    
    async GetUserSocket(userId: number): Promise<Socket> | null {
        return this.chatGateway.GetUserSocketId(userId);
    }
}
