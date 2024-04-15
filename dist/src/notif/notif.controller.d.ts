import { NotifService } from './notif.service';
export declare class NotifController {
    private readonly notifService;
    constructor(notifService: NotifService);
    getNotifications(CurrentUser: any): Promise<import("./notif.service").NotifsDto[]>;
    processNotification(currentUser: any, data: any): Promise<{
        status: boolean;
        message: any;
    }>;
}
