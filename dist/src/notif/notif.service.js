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
exports.NotifService = void 0;
const common_1 = require("@nestjs/common");
const notif_entity_1 = require("./entities/notif.entity");
const notif_repository_1 = require("../utils/repositories/notif.repository");
const typeorm_1 = require("@nestjs/typeorm");
const friendreq_service_1 = require("../users/services/friendreq.service");
const roomschat_service_1 = require("../chat/services/roomschat.service");
const profileGateway_service_1 = require("../websockets/profile-gateway/profileGateway.service");
const chat_gateway_service_1 = require("../websockets/chat-gateway/chat-gateway.service");
;
let NotifService = class NotifService {
    constructor(roomRepository, friendReqService, roomsChatService, profileGatewayService, chatGatewayService) {
        this.roomRepository = roomRepository;
        this.friendReqService = friendReqService;
        this.roomsChatService = roomsChatService;
        this.profileGatewayService = profileGatewayService;
        this.chatGatewayService = chatGatewayService;
    }
    async create_Notification(current_user_id, NotifInfo) {
        const newNotif = new notif_entity_1.Notifications();
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
    async get_Current_Notifications(current_user_id) {
        const notification = await this.roomRepository.find({
            where: { notif_user_id: current_user_id },
            order: { created_at: 'DESC' }
        });
        const notifData = [];
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
    async process_Notification(current_user_id, notifId, action) {
        const notification = await this.roomRepository.findOne({ where: { id: notifId } });
        if (notification) {
            const token = notification.notif_target;
            let res;
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
                };
            }
        }
        throw new Error('Notification not found');
    }
    async get_NotificationByNotif_target(notif_target) {
        const notification = await this.roomRepository.findOne({
            where: { notif_target: notif_target }
        });
        return notification;
    }
    async update_NotificationById(current_user_id, notifId, status) {
        const notification = await this.roomRepository.update({ id: notifId }, { notif_status: status });
        if (notification) {
            const notif = await this.roomRepository.findOne({ where: { id: notifId } });
            if (notif) {
                this.profileGatewayService.notification_update(notif.notif_user_id);
                this.profileGatewayService.notification_update(current_user_id);
            }
        }
        return notification;
    }
    async delete_NotificationById(current_user_id, notifId) {
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
};
exports.NotifService = NotifService;
exports.NotifService = NotifService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notif_entity_1.Notifications)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => friendreq_service_1.FriendReqService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => roomschat_service_1.RoomsChatService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => profileGateway_service_1.ProfileGatewayService))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => chat_gateway_service_1.ChatGatewayService))),
    __metadata("design:paramtypes", [notif_repository_1.NotifRepository,
        friendreq_service_1.FriendReqService,
        roomschat_service_1.RoomsChatService,
        profileGateway_service_1.ProfileGatewayService,
        chat_gateway_service_1.ChatGatewayService])
], NotifService);
//# sourceMappingURL=notif.service.js.map