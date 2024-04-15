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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../utils/guards/auth.guard");
const userInfo_decorator_1 = require("../utils/decorator/userInfo.decorator");
const dto_1 = require("../utils/dto");
const users_service_1 = require("./services/users.service");
const friendreq_service_1 = require("./services/friendreq.service");
const profile_service_1 = require("./services/profile.service");
const block_service_1 = require("./services/block.service");
const swagger_1 = require("@nestjs/swagger");
let UsersController = class UsersController {
    constructor(usersService, friendReqService, profileService, blockService) {
        this.usersService = usersService;
        this.friendReqService = friendReqService;
        this.profileService = profileService;
        this.blockService = blockService;
    }
    async get_statistics(Currentuser, user_id) {
        try {
            return await this.usersService.get_user_statistics(user_id);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async get_achievements(Currentuser) {
        try {
            await this.usersService.get_achievements(Currentuser.sub);
            return ("achievements");
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async get_level_info(Currentuser, user_id) {
        try {
            return await this.usersService.get_user_progress(user_id);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    test(Currentuser, user_id) {
        try {
            return this.usersService.get_user_matches(user_id);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    isloggedin(Currentuser) {
    }
    async get_all_users(Currentuser) {
        try {
            const current_user_id = Currentuser.sub;
            return await this.profileService.get_all_users(current_user_id);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async get_leaderboard() {
        try {
            return await this.usersService.get_leaderboard();
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async get_user_profile(Currentuser) {
        try {
            const current_user_id = Currentuser.sub;
            return await this.profileService.get_user_profile(Currentuser.sub);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async get_user_by_email(Email) {
        try {
            return await this.usersService.get_user_by_email(Email);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async get_user_by_id(Currentuser, user_id) {
        try {
            const current_user_id = Currentuser.sub;
            return await this.profileService.get_user_by_id(current_user_id, user_id);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async update_user(Currentuser, UserUpdatedInfo) {
        try {
            return await this.profileService.update_user(Currentuser.sub, UserUpdatedInfo);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async getFriends(Currentuser) {
        try {
            const current_user_id = Currentuser.sub;
            const friends = this.profileService.getAllFriends(current_user_id);
            return (await friends);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async getPendingFriendRequests(Currentuser) {
        try {
            const current_user_id = Currentuser.sub;
            const PendingFriendRequests = this.friendReqService.getPendingFriendRequests(current_user_id);
            return (await PendingFriendRequests);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async getBlockedFriends(Currentuser) {
        try {
            const current_user_id = Currentuser.sub;
            const BlockedFriends = this.blockService.getblockedfriends(current_user_id);
            return (await BlockedFriends);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async sendFriendRequest(Currentuser, FriendRequest) {
        try {
            const current_user_id = Currentuser.sub;
            return await this.friendReqService.sendFriendRequest(current_user_id, FriendRequest.receiverId);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async acceptFriendRequest(Currentuser, FriendRequest) {
        try {
            const current_user_id = Currentuser.sub;
            return await this.friendReqService.acceptFriendRequest(current_user_id, FriendRequest.friendId);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async rejectFriendRequest(Currentuser, FriendRequest) {
        try {
            const current_user_id = Currentuser.sub;
            return await this.friendReqService.rejectFriendRequest(current_user_id, FriendRequest.friendId);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async deleteFriend(Currentuser, friendId) {
        try {
            const current_user_id = Currentuser.sub;
            return await this.friendReqService.deleteFriend(current_user_id, friendId);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async unblockFriend(Currentuser, FriendRequest) {
        try {
            const current_user_id = Currentuser.sub;
            return await this.blockService.unblockfriend(current_user_id, FriendRequest.friendId);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async blockFriend(Currentuser, FriendRequest) {
        try {
            const current_user_id = Currentuser.sub;
            return await this.blockService.blockfriend(current_user_id, FriendRequest.friendId);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)("statistics/:user_id"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("user_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "get_statistics", null);
__decorate([
    (0, common_1.Get)("achievements"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "get_achievements", null);
__decorate([
    (0, common_1.Get)("levelinfo/:user_id"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("user_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "get_level_info", null);
__decorate([
    (0, common_1.Get)("match/:user_id"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("user_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "test", null);
__decorate([
    (0, common_1.Get)("isloggedin"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "isloggedin", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "get_all_users", null);
__decorate([
    (0, common_1.Get)("leaderboard"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "get_leaderboard", null);
__decorate([
    (0, common_1.Get)("profile"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "get_user_profile", null);
__decorate([
    (0, common_1.Get)("email/:email"),
    __param(0, (0, common_1.Param)("email")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "get_user_by_email", null);
__decorate([
    (0, common_1.Get)("id/:id"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "get_user_by_id", null);
__decorate([
    (0, common_1.Put)("update"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.userInfo, dto_1.UserUpdatedDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update_user", null);
__decorate([
    (0, common_1.Get)("friends"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getFriends", null);
__decorate([
    (0, common_1.Get)("getPendingFriendRequests"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.userInfo]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getPendingFriendRequests", null);
__decorate([
    (0, common_1.Get)("getBlockedFriends"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.userInfo]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getBlockedFriends", null);
__decorate([
    (0, common_1.Post)("sendFriendRequest"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.userInfo, dto_1.SendFriendRequestDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "sendFriendRequest", null);
__decorate([
    (0, common_1.Post)("acceptFriendRequest"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.userInfo, dto_1.InfoDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "acceptFriendRequest", null);
__decorate([
    (0, common_1.Post)("rejectFriendRequest"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.userInfo, dto_1.InfoDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "rejectFriendRequest", null);
__decorate([
    (0, common_1.Delete)("deleteFriend/:id"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.userInfo, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteFriend", null);
__decorate([
    (0, common_1.Post)("unblockFriend"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.userInfo, dto_1.InfoDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "unblockFriend", null);
__decorate([
    (0, common_1.Post)("blockFriend"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.userInfo, dto_1.InfoDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "blockFriend", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.UseGuards)(auth_guard_1.AlreadyLoggedInGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        friendreq_service_1.FriendReqService,
        profile_service_1.ProfileService,
        block_service_1.BlockService])
], UsersController);
//# sourceMappingURL=users.controller.js.map