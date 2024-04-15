import { PrivateChatService } from './services/Privatechat.service';
import { RoomsChatService } from './services/roomschat.service';
import { ChatGatewayService } from 'src/websockets/chat-gateway/chat-gateway.service';
export interface Message {
    receiver_id: number;
    message_content: string;
}
export declare class JoinRoomDto {
    room_id: number;
    password: string;
}
export declare class ChatController {
    private readonly PrivateChatService;
    private readonly roomsChatService;
    private readonly chatGatewayService;
    constructor(PrivateChatService: PrivateChatService, roomsChatService: RoomsChatService, chatGatewayService: ChatGatewayService);
    test(currentuser: any): Promise<void>;
    createRoom(currentUserinfo: any, data: any): Promise<{
        status: number;
        done: boolean;
        message: string;
    }>;
    doaction(currentuser: any, data: any): Promise<void>;
    inviteFriend(currentuser: any, data: any): Promise<{
        invited: boolean;
        message: string;
    }>;
    deleteRoom(currentuser: any, roomId: number): Promise<import("./entities/room.entity").Room>;
    getallrooms(currentuser: any): Promise<import("../utils/dto").RoomDto[]>;
    getroommembers(currentUserinfo: any, roomId: number): Promise<any[]>;
    createRoomMessage(): Promise<{
        messageId: number;
        userId: number;
        userName: string;
        userAvatar: string;
        time: string;
        fullTime: string;
        message: string;
    }>;
    getRoomMessages(currentUserinfo: any, roomId: number): Promise<any[]>;
    addRoom(currentUserinfo: any, name: string, type: string): Promise<void>;
    getRoom(room_id: number): Promise<import("./entities/room.entity").Room>;
    joinRoom2(currentUser: any, data: JoinRoomDto, res: any): Promise<void>;
    createNewMessage(currentUser: any, data: any): Promise<{
        messageId: number;
        userId: number;
        userName: string;
        userAvatar: string;
        time: string;
        fullTime: string;
        message: string;
    }>;
    getMessages(currentUser: any, friend_id: number): Promise<import("./services/Privatechat.service").MessageDto[]>;
    getCurrentPm(currentUser: any): Promise<import("../utils/dto").UserDto[]>;
    DeleteMessage(): Promise<void>;
}
