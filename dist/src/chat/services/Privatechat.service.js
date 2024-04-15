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
exports.PrivateChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const profile_service_1 = require("../../users/services/profile.service");
const entities_1 = require("../../users/entities");
const friendreq_service_1 = require("../../users/services/friendreq.service");
const users_service_1 = require("../../users/services/users.service");
const repositories_1 = require("../../utils/repositories");
const privatechat_entity_1 = require("../entities/privatechat.entity");
;
let PrivateChatService = class PrivateChatService {
    constructor(privateChatRepository, friendshipRepository, friendReqService, usersService, profileService) {
        this.privateChatRepository = privateChatRepository;
        this.friendshipRepository = friendshipRepository;
        this.friendReqService = friendReqService;
        this.usersService = usersService;
        this.profileService = profileService;
        this.timeFormat = (dateString) => {
            const dateObject = new Date(dateString);
            const formattedDate = dateObject.toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
            return formattedDate;
        };
    }
    async createNewMessage(sender_id, receiver_id, message_content) {
        const user = await this.usersService.user_data(sender_id);
        const friend = await this.usersService.user_data(receiver_id);
        if (user && friend && user.user_id !== friend.user_id) {
            const friendship = await this.friendReqService.getFriendShip(user.user_id, friend.user_id);
            if (friendship && friendship.status === 'accepted') {
                const newMessage = new privatechat_entity_1.PrivateChat();
                newMessage.sender = user;
                newMessage.receiver = friend;
                newMessage.content = message_content;
                newMessage.friendship = friendship;
                newMessage.timestamp = new Date();
                const savedMessage = await this.privateChatRepository.save(newMessage);
                if (savedMessage) {
                    return ({
                        messageId: savedMessage.message_id,
                        userId: savedMessage.sender.user_id,
                        userName: savedMessage.sender.user_name,
                        userAvatar: savedMessage.sender.profile.user_avatar,
                        time: this.timeFormat(savedMessage.timestamp.toISOString()),
                        fullTime: savedMessage.timestamp.toISOString(),
                        message: savedMessage.content
                    });
                }
                return null;
            }
        }
        throw new Error("Friendship not found");
    }
    async DeleteMessage(message_id) {
        const message = await this.privateChatRepository.findOne({
            where: { message_id: message_id },
            relations: ['friendship'],
        });
        if (message) {
            await this.privateChatRepository.remove(message);
        }
    }
    async getMessageCount(user_id, friend_id) {
        const user = await this.usersService.user_data(user_id);
        const friend = await this.usersService.user_data(friend_id);
        if (user && friend) {
            const friendship = await this.friendReqService.getFriendShip(user.user_id, friend.user_id);
            if (friendship) {
                const f = await this.friendshipRepository.findOne({
                    where: [
                        { id: friendship.id, messages: { isRead: false, receiver: { user_id: user_id } } },
                    ],
                    relations: ['messages', 'messages.sender', "messages.sender.profile"],
                });
                if (f) {
                    return f.messages.length;
                }
            }
        }
        return 0;
    }
    async markAsRead(user_id, friend_id) {
        if (user_id !== undefined && friend_id !== undefined) {
            const user = await this.usersService.user_data(user_id);
            const friend = await this.usersService.user_data(friend_id);
            if (user && friend) {
                return await this.privateChatRepository.update({
                    receiver: {
                        user_id: user_id
                    },
                    sender: {
                        user_id: friend_id
                    },
                    isRead: false
                }, {
                    isRead: true
                });
            }
        }
        throw new Error("User not found");
    }
    async getMessages(user_id, friend_id) {
        const user = await this.usersService.user_data(user_id);
        const friend = await this.usersService.user_data(friend_id);
        if (user && friend) {
            const friendship = await this.friendReqService.getFriendShip(user.user_id, friend.user_id);
            if (friendship) {
                const f = await this.friendshipRepository.findOne({
                    where: [
                        { id: friendship.id },
                    ],
                    relations: ['messages', 'messages.sender', "messages.sender.profile"],
                });
                if (f) {
                    const messages = f.messages;
                    let UserMessages = [];
                    messages.map((message) => {
                        UserMessages.push({
                            messageId: message.message_id,
                            userId: message.sender.user_id,
                            userName: message.sender.user_name,
                            userAvatar: message.sender.profile.user_avatar,
                            time: this.timeFormat(message.timestamp.toISOString()),
                            message: message.content
                        });
                    });
                    return (UserMessages);
                }
            }
        }
        return [];
    }
    async getCurrentUserPm(current_user_id) {
        const current_user = await this.usersService.user_data(current_user_id);
        if (current_user) {
            const friendshipsWithMessages = await this.friendshipRepository.find({
                relations: ['messages', 'sender', 'receiver'],
                where: [
                    { sender: { user_id: current_user.user_id }, status: 'accepted' },
                    { receiver: { user_id: current_user.user_id }, status: 'accepted' },
                ],
                order: {
                    messages: {
                        timestamp: "DESC"
                    }
                }
            });
            let friends = [];
            for (let i = 0; i < friendshipsWithMessages.length; i++) {
                if (friendshipsWithMessages[i].messages.length > 0) {
                    let user_data;
                    if (friendshipsWithMessages[i].sender.user_id === current_user_id) {
                        user_data = await this.usersService.user_data(friendshipsWithMessages[i].receiver.user_id);
                    }
                    else {
                        user_data = await this.usersService.user_data(friendshipsWithMessages[i].sender.user_id);
                    }
                    const MessageCount = await this.getMessageCount(current_user_id, user_data.user_id);
                    friends.push({
                        id: user_data.user_id,
                        name: user_data.user_name,
                        currentAvatar: user_data.profile.user_avatar,
                        status: user_data.profile.user_Status,
                        friendShipToken: friendshipsWithMessages[i].friendshiptoekn,
                        UnreadMessagesCount: MessageCount,
                        TimeOfLastmessage: (friendshipsWithMessages[i].messages[0]) ? (friendshipsWithMessages[i].messages[0].timestamp.toISOString()) : ""
                    });
                }
            }
            return (friends);
        }
        return ([]);
    }
};
exports.PrivateChatService = PrivateChatService;
exports.PrivateChatService = PrivateChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(privatechat_entity_1.PrivateChat)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Friendship)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => friendreq_service_1.FriendReqService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => profile_service_1.ProfileService))),
    __metadata("design:paramtypes", [repositories_1.PrivateChatRepository,
        repositories_1.FriendShipRepository,
        friendreq_service_1.FriendReqService,
        users_service_1.UsersService,
        profile_service_1.ProfileService])
], PrivateChatService);
//# sourceMappingURL=Privatechat.service.js.map