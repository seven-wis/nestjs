import { Socket } from 'socket.io';
import { PrivateChatService } from 'src/chat/services/Privatechat.service';
import { RoomsChatService } from 'src/chat/services/roomschat.service';
import { ProfileService } from 'src/users/services/profile.service';
import { ChatGateway } from './chat-gateway.gateway';
export declare class ChatGatewayService {
    private readonly privateChatService;
    private readonly roomsChatService;
    private readonly profileService;
    private chatGateway;
    constructor(privateChatService: PrivateChatService, roomsChatService: RoomsChatService, profileService: ProfileService, chatGateway: ChatGateway);
    CreateRoom(RoomData: any): Promise<{
        status: number;
        message: string;
        data: {
            roomId: number;
            roomName: string;
            ChannelType: number;
            ownerAvatar: string;
            numberOfMembers: number;
            owner: number;
            InRoom: boolean;
            LastMessageTime: string;
            UnReadedCount: number;
        };
    } | {
        status: number;
        message: any;
        data?: undefined;
    }>;
    updateRoomInfo(RoomData: any): Promise<{
        status: number;
        message: string;
        data: import("../../chat/entities/room.entity").Room;
    } | {
        status: number;
        message: string;
        data?: undefined;
    }>;
    CreateRoomMessage(messageBody: any): Promise<void>;
    EmitMessage(target: any, event: string, data: any): Promise<void>;
    BroadcastMessage(event: string, data: any): Promise<void>;
    GetUserSocket(userId: number): Promise<Socket> | null;
}
