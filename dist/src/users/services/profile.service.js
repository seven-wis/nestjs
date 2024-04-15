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
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const entities_1 = require("../entities");
const typeorm_1 = require("@nestjs/typeorm");
const repositories_1 = require("../../utils/repositories");
const dto_1 = require("../../utils/dto");
const friendreq_service_1 = require("./friendreq.service");
const block_service_1 = require("./block.service");
const users_service_1 = require("./users.service");
let ProfileService = class ProfileService {
    constructor(UsersRepo, FriendsRepo, ProfileRepo, friendReqService, blockService, usersService) {
        this.UsersRepo = UsersRepo;
        this.FriendsRepo = FriendsRepo;
        this.ProfileRepo = ProfileRepo;
        this.friendReqService = friendReqService;
        this.blockService = blockService;
        this.usersService = usersService;
    }
    async get_friendship_by_id(sender, receiver) {
        return await this.FriendsRepo.findOne({
            where: [
                { sender: { user_id: sender }, receiver: { user_id: receiver } },
                { sender: { user_id: receiver }, receiver: { user_id: sender } }
            ],
            relations: ['sender', 'receiver']
        });
    }
    async get_all_users(currentUser_id) {
        const allUsers = await this.UsersRepo.find({ relations: ['profile'] });
        const allUsersRes = [];
        for (let i = 0; i < allUsers.length; i++) {
            const friendship = await this.get_friendship_by_id(currentUser_id, allUsers[i].user_id);
            if (friendship && friendship.status === 'blocked') {
                continue;
            }
            allUsersRes.push({
                id: allUsers[i].user_id,
                name: allUsers[i].user_name,
                currentAvatar: allUsers[i].profile.user_avatar,
            });
        }
        return allUsersRes;
    }
    async get_user_profile(current_user_id) {
        const user = await this.UsersRepo.findOne({
            where: { user_id: current_user_id },
            relations: ['profile']
        });
        const friends = await this.getAllFriends(current_user_id);
        const FriendReq = await this.friendReqService.getPendingFriendRequests(current_user_id);
        const blocked = await this.blockService.getblockedfriends(current_user_id);
        const FrontUser = {
            id: user.user_id,
            name: user.user_name,
            email: user.profile.user_email,
            status: user.profile.user_Status,
            firsName: user.profile.user_firstName,
            lastName: user.profile.user_lastName,
            currentAvatar: user.profile.user_avatar,
            wins: user.profile.wins,
            loses: user.profile.loses,
            score: user.profile.score,
            firstlogin: user.profile.firstlogin,
            twoFactAuth: user.profile.twoFactAuth,
            BotLevel: user.profile.BotLevel,
            friends: friends,
            friendRequest: FriendReq,
            blocked: blocked
        };
        return FrontUser;
    }
    async get_user_by_id(current_user_id, user_id) {
        const friendship = await this.get_friendship_by_id(current_user_id, user_id);
        if ((friendship && friendship.status === 'blocked') || user_id == current_user_id) {
            throw new common_1.ForbiddenException('Resource not found');
        }
        const friendFilter = async function (UserInfoFriends) {
            for (let i = 0; i < UserInfoFriends.length; i++) {
                const friendship = await this.get_friendship_by_id(current_user_id, UserInfoFriends[i].id);
                if (friendship && friendship.status === 'blocked') {
                    UserInfoFriends.splice(i, 1);
                    i--;
                }
            }
            return UserInfoFriends;
        };
        const UserInfo = await this.get_user_profile(user_id);
        UserInfo.friends = await friendFilter.call(this, UserInfo.friends);
        let friend_status;
        if (friendship) {
            if (friendship.status === 'accepted') {
                friend_status = dto_1.FriendshipStatus.Isfriend;
            }
            else if (friendship.status === 'pending') {
                if (friendship.sender.user_id === current_user_id) {
                    friend_status = dto_1.FriendshipStatus.RequestSend;
                }
                else {
                    friend_status = dto_1.FriendshipStatus.RequestRecived;
                }
            }
        }
        else {
            friend_status = dto_1.FriendshipStatus.non;
        }
        const UserInfoRes = {
            id: UserInfo.id,
            name: UserInfo.name,
            status: (friendship && friendship.status === "accepted") ? UserInfo.status : dto_1.UserStatus.Walo,
            FriendshipStatus: friend_status,
            firsName: UserInfo.firsName,
            lastName: UserInfo.lastName,
            currentAvatar: UserInfo.currentAvatar,
            wins: UserInfo.wins,
            loses: UserInfo.loses,
            score: UserInfo.score,
            friends: UserInfo.friends,
            friendShipToken: friendship ? friendship.friendshiptoekn : null
        };
        return UserInfoRes;
    }
    async getAllFriends(userId) {
        const friendships = await this.FriendsRepo.find({
            where: [
                { sender: { user_id: userId }, status: 'accepted' },
                { receiver: { user_id: userId }, status: 'accepted' },
            ],
            relations: [
                'sender', 'receiver'
            ],
        });
        const FrontAllFriends = [];
        const friends = friendships.map((friendship) => { return friendship.sender.user_id == userId ? friendship.receiver : friendship.sender; });
        for (let i = 0; i < friends.length; i++) {
            friends[i] = await this.usersService.user_data(friends[i].user_id);
            FrontAllFriends.push({
                id: friends[i].user_id,
                name: friends[i].user_name,
                currentAvatar: friends[i].profile.user_avatar,
                status: friends[i].profile.user_Status,
                friendShipToken: friendships[i].friendshiptoekn,
                IsFriend: true,
            });
        }
        return FrontAllFriends;
    }
    async update_user(current_user_id, userdata) {
        const user = await this.UsersRepo.findOne({
            where: { user_id: current_user_id },
            relations: ['profile']
        });
        if (user) {
            const profile = await this.ProfileRepo.findOne({
                where: { id: user.profile.id }
            });
            user.user_name = userdata.user_username;
            profile.firstlogin = false;
            profile.user_firstName = userdata.user_firstName;
            profile.user_lastName = userdata.user_lastName;
            profile.user_avatar = `${userdata.user_avatar}`;
            await this.ProfileRepo.save(profile);
            return await this.UsersRepo.save(user);
        }
        throw new common_1.NotFoundException('User not found');
    }
    async update_user_account(user) {
        return await this.UsersRepo.save(user);
    }
    async add_two_factor_auth(current_user_id, secret, twoFactAuth = false) {
        const user = await this.UsersRepo.findOne({
            where: { user_id: current_user_id },
            relations: ['profile']
        });
        if (user) {
            const profile = await this.ProfileRepo.findOne({
                where: { id: user.profile.id }
            });
            profile.twoFactAuth = twoFactAuth;
            profile.twoFactSecret = secret;
            await this.ProfileRepo.save(profile);
            return await this.UsersRepo.save(user);
        }
        throw new common_1.NotFoundException('User not found');
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Friendship)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Profile)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => friendreq_service_1.FriendReqService))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => block_service_1.BlockService))),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __metadata("design:paramtypes", [repositories_1.UsersRepository,
        repositories_1.FriendShipRepository,
        repositories_1.ProfileRepository,
        friendreq_service_1.FriendReqService,
        block_service_1.BlockService,
        users_service_1.UsersService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map