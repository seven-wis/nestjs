import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Notifications } from './entities/notif.entity';
import { NotifRepository } from 'src/utils/repositories/notif.repository';
import { InjectRepository } from '@nestjs/typeorm';
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
};


@Injectable()
export class NotifService {

    constructor(
        @InjectRepository(Notifications) private readonly roomRepository: NotifRepository,
        @Inject(forwardRef(() => FriendReqService)) private readonly friendReqService: FriendReqService,
        @Inject(forwardRef(() => RoomsChatService)) private readonly roomsChatService: RoomsChatService,
        @Inject(forwardRef(() => ProfileGatewayService)) private readonly profileGatewayService: ProfileGatewayService,
        @Inject(forwardRef(() => ChatGatewayService)) private readonly chatGatewayService: ChatGatewayService,
    ) { }

    async create_Notification(current_user_id: number, NotifInfo: any) {
        const newNotif = new Notifications();

        newNotif.notif_user_id = NotifInfo.notif_user_id;
        newNotif.notif_avatar = NotifInfo.notif_avatar;
        newNotif.notif_description = NotifInfo.notif_description;
        newNotif.notif_title = NotifInfo.notif_title;
        newNotif.notif_type = NotifInfo.notif_type;
        newNotif.notif_status = NotifInfo.notif_status;
        newNotif.notif_target = NotifInfo.notif_target;

        const res = await this.roomRepository.save(newNotif);
        if (res) {
            this.profileGatewayService.notification_update(res.notif_user_id);
            this.profileGatewayService.notification_update(current_user_id);
            return res;
        }
    }

    async get_Current_Notifications(current_user_id: number) {
        const notification = await this.roomRepository.find({
            where: { notif_user_id: current_user_id },
            order: { created_at: 'DESC' }
        });
        const notifData: NotifsDto[] = [];
        for (const notif of notification) {
            notifData.push({
                avatar: notif.notif_avatar,
                title: notif.notif_title,
                description: notif.notif_description,
                type: notif.notif_type,
                status: notif.notif_status,
                date: notif.created_at.toDateString(),
                notifId: notif.id,
            });
        }

        return (notifData);
    }

    async process_Notification(current_user_id, notifId: number, action: string) {

        const notification = await this.roomRepository.findOne({ where: { id: notifId } });
        if (notification) {
            const token = notification.notif_target;
            let res : any;
            if ('friendReq' == notification.notif_type) {
                res = await this.friendReqService.do_event_by_token(current_user_id, notification.id, token, action);
            }
            if ('roomInvit' == notification.notif_type) {
                res = await this.roomsChatService.do_event_by_token(current_user_id, notification.id, token, action);
            }

            if (res.res) {
                await this.delete_NotificationById(current_user_id, notifId);
                return {
                    status: true,
                    message: res.message
                }
            }
        }
        throw new Error('Notification not found');
    }

    async get_NotificationByNotif_target(notif_target: string) {
        const notification = await this.roomRepository.findOne({
            where: { notif_target: notif_target }
        });
        return notification;
    }

    async update_NotificationById(current_user_id: number, notifId: number, status: string) {
        const notification = await this.roomRepository.update(
            { id: notifId },
            { notif_status: status }
        );

        if (notification) {
            const notif = await this.roomRepository.findOne({ where: { id: notifId } });
            if (notif) {
                this.profileGatewayService.notification_update(notif.notif_user_id);
                this.profileGatewayService.notification_update(current_user_id);

            }
        }


        return notification;
    }

    async delete_NotificationById(current_user_id: number, notifId: number) {
        const notif = await this.roomRepository.findOne({ where: { id: notifId } });
        const notification = await this.roomRepository.delete({ id: notifId });
        if (notification) {
            if (notif) {
                this.profileGatewayService.notification_update(notif.notif_user_id);
                this.profileGatewayService.notification_update(current_user_id);
            }
        }
        return notification;
    }
}
