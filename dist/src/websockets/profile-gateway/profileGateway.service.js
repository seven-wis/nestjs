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
exports.ProfileGatewayService = void 0;
const common_1 = require("@nestjs/common");
const profileGateway_gateway_1 = require("./profileGateway.gateway");
const betting_service_1 = require("../../users/services/betting.service");
const users_service_1 = require("../../users/services/users.service");
const achievment_service_1 = require("../../users/services/achievment.service");
let ProfileGatewayService = class ProfileGatewayService {
    constructor(profileGateway, usersService, achievementsService, bettingService) {
        this.profileGateway = profileGateway;
        this.usersService = usersService;
        this.achievementsService = achievementsService;
        this.bettingService = bettingService;
    }
    async friend_ship_event_emitter(event, current_user_id, friend_id) {
        this.profileGateway.friend_ship_event_emitter(event, current_user_id, friend_id);
    }
    async notification_update(user_target_id) {
        this.profileGateway.notification_update(user_target_id);
    }
    async friend_Ship_event(user_event_sender, user_event_receiver) {
        this.profileGateway.friend_Ship_event(user_event_sender, user_event_receiver);
    }
    async game_betting(bettingObject) {
        return await this.bettingService.createBetting(bettingObject.current_user_id, bettingObject);
    }
    async EmitMessage(target, event, data) {
        this.profileGateway.EmitMessage(target, event, data);
    }
    async newAchievementUnlock(userId) {
        console.log("newAchievementUnlock");
        await this.achievementsService.ShowunsenAchievements(userId);
    }
};
exports.ProfileGatewayService = ProfileGatewayService;
exports.ProfileGatewayService = ProfileGatewayService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => profileGateway_gateway_1.ProfileGateway))),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => achievment_service_1.AchievementsService))),
    __metadata("design:paramtypes", [profileGateway_gateway_1.ProfileGateway,
        users_service_1.UsersService,
        achievment_service_1.AchievementsService,
        betting_service_1.BettingService])
], ProfileGatewayService);
//# sourceMappingURL=profileGateway.service.js.map