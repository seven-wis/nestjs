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
exports.FriendReqService = void 0;
const common_1 = require("@nestjs/common");
const entities_1 = require("../entities");
const typeorm_1 = require("@nestjs/typeorm");
const repositories_1 = require("../../utils/repositories");
const users_service_1 = require("./users.service");
const uuid_1 = require("uuid");
const notif_service_1 = require("../../notif/notif.service");
const profileGateway_service_1 = require("../../websockets/profile-gateway/profileGateway.service");
let FriendReqService = class FriendReqService {
    constructor(UsersRepo, FriendsRepo, ProfileRepo, usersService, notifService, profileGatewayService) {
        this.UsersRepo = UsersRepo;
        this.FriendsRepo = FriendsRepo;
        this.ProfileRepo = ProfileRepo;
        this.usersService = usersService;
        this.notifService = notifService;
        this.profileGatewayService = profileGatewayService;
    }
    async sendFriendRequest(senderId, receiverId) {
        const sender = await this.UsersRepo.findOne({
            where: {
                user_id: senderId
            },
            relations: ['profile']
        });
        const receiver = await this.UsersRepo.findOne({
            where: {
                user_id: receiverId
            },
            relations: ['profile']
        });
        if (sender && receiver && senderId !== receiverId) {
            const existingFriendship = await this.FriendsRepo.findOne({
                where: [
                    { sender: { user_id: sender.user_id }, receiver: { user_id: receiver.user_id } },
                    { sender: { user_id: receiver.user_id }, receiver: { user_id: sender.user_id } },
                ],
            });
            if (!existingFriendship) {
                const newFriendRequest = this.FriendsRepo.create({
                    friendshiptoekn: (sender.user_id.toString() + (0, uuid_1.v4)() + receiver.user_id.toString()),
                    sender,
                    receiver,
                    friend: { user_id: receiver.user_id },
                    status: 'pending',
                });
                const res = await this.FriendsRepo.save(newFriendRequest);
                if (res) {
                    this.notifService.create_Notification(senderId, {
                        notif_user_id: receiver.user_id,
                        notif_avatar: sender.profile.user_avatar,
                        notif_description: `${sender.user_name} sent you a friend request`,
                        notif_title: 'Friend Request',
                        notif_type: 'friendReq',
                        notif_status: 'unread',
                        notif_target: newFriendRequest.friendshiptoekn
                    });
                    return res;
                }
            }
        }
        throw new common_1.ForbiddenException('Request rejected Because the user is already a friend or the user does not exist');
    }
    async getPendingFriendRequests(currentUserId) {
        const currentUser = await this.UsersRepo.findOne({
            where: { user_id: currentUserId }
        });
        if (currentUser) {
            const pendingFriendRequests = await this.FriendsRepo.find({
                where: {
                    receiver: { user_id: currentUser.user_id },
                    status: 'pending',
                },
                relations: ['sender'],
            });
            const FriendReq = [];
            for (let i = 0; i < pendingFriendRequests.length; i++) {
                const user = await this.usersService.user_data(pendingFriendRequests[i].sender.user_id);
                FriendReq.push({
                    id: user.user_id,
                    name: user.user_name,
                    currentAvatar: user.profile.user_avatar,
                    status: user.profile.user_Status,
                });
            }
            return FriendReq;
        }
        throw new common_1.NotFoundException('User not found');
    }
    async do_event_by_token(curent_user_id, notif_id, friendship_token, event) {
        const currentUser = await this.UsersRepo.findOne({
            where: { user_id: curent_user_id }
        });
        const friendship = await this.FriendsRepo.findOne({
            where: { friendshiptoekn: friendship_token },
            relations: ['sender', 'receiver']
        });
        if (currentUser && friendship && friendship.status === 'pending') {
            let res;
            let friend_id = (friendship.sender.user_id === currentUser.user_id) ? friendship.receiver.user_id : friendship.sender.user_id;
            if (event === 'Accept') {
                res = await this.acceptFriendRequest(currentUser.user_id, friend_id);
            }
            else if (event === 'Reject') {
                res = await this.rejectFriendRequest(currentUser.user_id, friend_id);
            }
            if (res) {
                this.profileGatewayService.friend_ship_event_emitter(event.toLocaleLowerCase(), currentUser.user_id, friend_id);
                return {
                    res,
                    message: `You have ${event.toLocaleLowerCase()}'ed the friend request`
                };
            }
            throw new common_1.ForbiddenException('Friendship not found');
        }
        throw new common_1.NotFoundException('Friendship not found');
    }
    async acceptFriendRequest(currentUserId, friendId) {
        const currentUser = await this.UsersRepo.findOne({ where: { user_id: currentUserId } });
        const friend = await this.UsersRepo.findOne({ where: { user_id: friendId } });
        if (currentUser && friend) {
            const friendshipToAccept = await this.FriendsRepo.findOne({
                where: [
                    { sender: { user_id: friend.user_id }, receiver: { user_id: currentUser.user_id } },
                    { sender: { user_id: currentUser.user_id }, receiver: { user_id: friend.user_id } },
                ],
                relations: ['sender', 'receiver'],
            });
            if (friendshipToAccept && friendshipToAccept.status === 'pending') {
                friendshipToAccept.status = 'accepted';
                const res = await this.FriendsRepo.save(friendshipToAccept);
                const notif = await this.notifService.get_NotificationByNotif_target(friendshipToAccept.friendshiptoekn);
                if (notif) {
                    this.profileGatewayService.friend_Ship_event(currentUser.user_id, friend.user_id);
                    await this.notifService.update_NotificationById(currentUserId, notif.id, 'read');
                }
                return res;
            }
            else {
                throw new common_1.NotFoundException('Friendship not found');
            }
        }
        throw new common_1.NotFoundException('Friendship not found');
    }
    async rejectFriendRequest(currentUserId, friendId) {
        const currentUser = await this.UsersRepo.findOne({ where: { user_id: currentUserId } });
        const friend = await this.UsersRepo.findOne({ where: { user_id: friendId } });
        if (currentUser && friend) {
            const friendshipToReject = await this.FriendsRepo.findOne({
                where: [
                    { sender: { user_id: friend.user_id }, receiver: { user_id: currentUser.user_id } },
                    { sender: { user_id: currentUser.user_id }, receiver: { user_id: friend.user_id } },
                ],
                relations: ['sender', 'receiver'],
            });
            if (friendshipToReject && friendshipToReject.status === 'pending') {
                const res = await this.FriendsRepo.remove(friendshipToReject);
                if (res) {
                    const notif = await this.notifService.get_NotificationByNotif_target(friendshipToReject.friendshiptoekn);
                    if (notif) {
                        this.profileGatewayService.friend_Ship_event(currentUser.user_id, friend.user_id);
                        await this.notifService.delete_NotificationById(currentUserId, notif.id);
                    }
                    return res;
                }
            }
        }
        throw new common_1.NotFoundException('Friendship not found');
    }
    async deleteFriend(currentUserId, friendId) {
        const currentUser = await this.UsersRepo.findOne({ where: { user_id: currentUserId } });
        const friend = await this.UsersRepo.findOne({ where: { user_id: friendId } });
        if (currentUser && friend) {
            const friendshipToRemove = await this.FriendsRepo.findOne({
                where: [
                    { sender: { user_id: currentUser.user_id }, receiver: { user_id: friend.user_id } },
                    { sender: { user_id: friend.user_id }, receiver: { user_id: currentUser.user_id } },
                ],
                relations: ['sender', 'receiver'],
            });
            if (friendshipToRemove) {
                this.profileGatewayService.friend_Ship_event(currentUser.user_id, friend.user_id);
                const res = await this.FriendsRepo.remove(friendshipToRemove);
                if (res) {
                    return res;
                }
            }
        }
        throw new common_1.NotFoundException('Friendship not found');
    }
    async getFriendShip(Sender_id, Receiver_id) {
        const Sender = await this.UsersRepo.findOne({ where: { user_id: Sender_id } });
        const Receiver = await this.UsersRepo.findOne({ where: { user_id: Receiver_id } });
        return await this.FriendsRepo.findOne({
            where: [
                { sender: { user_id: Sender.user_id }, receiver: { user_id: Receiver.user_id } },
                { sender: { user_id: Receiver.user_id }, receiver: { user_id: Sender.user_id } },
            ],
            relations: ['sender', 'receiver', 'blockedBy'],
        });
    }
};
exports.FriendReqService = FriendReqService;
exports.FriendReqService = FriendReqService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Friendship)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Profile)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => profileGateway_service_1.ProfileGatewayService))),
    __metadata("design:paramtypes", [repositories_1.UsersRepository,
        repositories_1.FriendShipRepository,
        repositories_1.ProfileRepository,
        users_service_1.UsersService,
        notif_service_1.NotifService,
        profileGateway_service_1.ProfileGatewayService])
], FriendReqService);
//# sourceMappingURL=friendreq.service.js.map