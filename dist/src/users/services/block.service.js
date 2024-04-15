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
exports.BlockService = void 0;
const common_1 = require("@nestjs/common");
const entities_1 = require("../entities");
const typeorm_1 = require("@nestjs/typeorm");
const repositories_1 = require("../../utils/repositories");
const profile_service_1 = require("./profile.service");
const users_service_1 = require("./users.service");
const profileGateway_service_1 = require("../../websockets/profile-gateway/profileGateway.service");
let BlockService = class BlockService {
    constructor(UsersRepo, FriendsRepo, ProfileRepo, usersService, profileService, profileGatewayService) {
        this.UsersRepo = UsersRepo;
        this.FriendsRepo = FriendsRepo;
        this.ProfileRepo = ProfileRepo;
        this.usersService = usersService;
        this.profileService = profileService;
        this.profileGatewayService = profileGatewayService;
    }
    async blockfriend(currentUserId, friendId) {
        const currentUser = await this.UsersRepo.findOne({ where: { user_id: currentUserId } });
        const friend = await this.UsersRepo.findOne({ where: { user_id: friendId } });
        if (currentUser && friend) {
            const friendshipToBlock = await this.FriendsRepo.findOne({
                where: [
                    { sender: { user_id: currentUser.user_id }, receiver: { user_id: friend.user_id } },
                    { sender: { user_id: friend.user_id }, receiver: { user_id: currentUser.user_id } },
                ],
                relations: ['sender', 'receiver'],
            });
            if (friendshipToBlock && friendshipToBlock.status === 'accepted') {
                friendshipToBlock.status = 'blocked';
                friendshipToBlock.blockedBy = currentUser;
                const res = await this.FriendsRepo.save(friendshipToBlock);
                if (res) {
                    this.profileGatewayService.friend_Ship_event(currentUser.user_id, friend.user_id);
                    return res;
                }
            }
            throw new common_1.ForbiddenException('Friendship not found');
        }
        throw new common_1.NotFoundException('Friendship not found');
    }
    async unblockfriend(currentUserId, friendId) {
        const currentUser = await this.UsersRepo.findOne({ where: { user_id: currentUserId } });
        const friend = await this.UsersRepo.findOne({ where: { user_id: friendId } });
        if (currentUser && friend) {
            const friendshipToBlock = await this.FriendsRepo.findOne({
                where: [
                    { sender: { user_id: currentUser.user_id }, receiver: { user_id: friend.user_id } },
                    { sender: { user_id: friend.user_id }, receiver: { user_id: currentUser.user_id } },
                ],
                relations: ['blockedBy', 'sender', 'receiver'],
            });
            if (friendshipToBlock && friendshipToBlock.status === 'blocked' && friendshipToBlock.blockedBy && friendshipToBlock.blockedBy.user_id == currentUser.user_id) {
                return await this.FriendsRepo.remove(friendshipToBlock);
            }
        }
        throw new common_1.NotFoundException('Friendship not found');
    }
    async getblockedfriends(currentUserId) {
        const currentUser = await this.UsersRepo.findOne({ where: { user_id: currentUserId } });
        if (currentUser) {
            const blockedFriends = await this.FriendsRepo.find({
                where: [
                    { sender: { user_id: currentUser.user_id }, status: 'blocked', blockedBy: { user_id: currentUser.user_id } },
                    { receiver: { user_id: currentUser.user_id }, status: 'blocked', blockedBy: { user_id: currentUser.user_id } },
                ],
                relations: ['blockedBy', 'receiver', 'sender'],
            });
            const FrontAllFriends = [];
            const B_friends = blockedFriends.map((friendship) => {
                return friendship.sender.user_id == currentUserId ? friendship.receiver : friendship.sender;
            });
            for (let i = 0; i < B_friends.length; i++) {
                B_friends[i] = await this.usersService.user_data(B_friends[i].user_id);
                FrontAllFriends.push({
                    id: B_friends[i].user_id,
                    name: B_friends[i].user_name,
                    currentAvatar: B_friends[i].profile.user_avatar,
                    status: B_friends[i].profile.user_Status,
                });
            }
            return FrontAllFriends;
        }
        throw new common_1.NotFoundException('User not found');
    }
};
exports.BlockService = BlockService;
exports.BlockService = BlockService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Friendship)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Profile)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => profile_service_1.ProfileService))),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => profileGateway_service_1.ProfileGatewayService))),
    __metadata("design:paramtypes", [repositories_1.UsersRepository,
        repositories_1.FriendShipRepository,
        repositories_1.ProfileRepository,
        users_service_1.UsersService,
        profile_service_1.ProfileService,
        profileGateway_service_1.ProfileGatewayService])
], BlockService);
//# sourceMappingURL=block.service.js.map