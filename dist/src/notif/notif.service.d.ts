import { Notifications } from './entities/notif.entity';
import { NotifRepository } from 'src/utils/repositories/notif.repository';
import { FriendReqService } from 'src/users/services/friendreq.service';
import { RoomsChatService } from 'src/chat/services/roomschat.service';
import { ProfileGatewayService } from 'src/websockets/profile-gateway/profileGateway.service';
import { ChatGatewayService } from 'src/websockets/chat-gateway/chat-gateway.service';
export interface NotifsDto {
    avatar: string;
    title: string;
    description: string;
    type: string;
    status: string;
    date: string;
    notifId: number;
}
export declare class NotifService {
    private readonly roomRepository;
    private readonly friendReqService;
    private readonly roomsChatService;
    private readonly profileGatewayService;
    private readonly chatGatewayService;
    constructor(roomRepository: NotifRepository, friendReqService: FriendReqService, roomsChatService: RoomsChatService, profileGatewayService: ProfileGatewayService, chatGatewayService: ChatGatewayService);
    create_Notification(current_user_id: number, NotifInfo: any): Promise<Notifications>;
    get_Current_Notifications(current_user_id: number): Promise<NotifsDto[]>;
    process_Notification(current_user_id: any, notifId: number, action: string): Promise<{
        status: boolean;
        message: any;
    }>;
    get_NotificationByNotif_target(notif_target: string): Promise<Notifications>;
    update_NotificationById(current_user_id: number, notifId: number, status: string): Promise<import("typeorm").UpdateResult>;
    delete_NotificationById(current_user_id: number, notifId: number): Promise<import("typeorm").DeleteResult>;
}
