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
exports.AchievementsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../entities");
const achievements_repository_1 = require("../../utils/repositories/achievements.repository");
const users_service_1 = require("./users.service");
const achievement_constant_1 = require("../../utils/constant/achievement.constant");
const profileGateway_service_1 = require("../../websockets/profile-gateway/profileGateway.service");
const dto_1 = require("../../utils/dto");
let AchievementsService = class AchievementsService {
    constructor(achievementsRepository, usersService, profileGatewayService) {
        this.achievementsRepository = achievementsRepository;
        this.usersService = usersService;
        this.profileGatewayService = profileGatewayService;
    }
    async getAchievements() {
        return achievement_constant_1.ACHIEVEMENT_LIST;
    }
    async getConstAchievement(userId) {
        return achievement_constant_1.ACHIEVEMENT_LIST.filter(achievement => achievement.Level_id === userId)[0] || null;
    }
    async createAchievement(userId, achievement_id) {
        const Achievement = await this.getConstAchievement(achievement_id);
        console.log(" Achievement: ", Achievement);
        if (Achievement) {
            const user = await this.usersService.user_data(userId);
            const Newachievement = new entities_1.Achievements();
            Newachievement.achievement_id = Achievement.id;
            Newachievement.image = Achievement.image;
            Newachievement.name = Achievement.name;
            Newachievement.time = new Date().toISOString().split('T')[0];
            Newachievement.Player = user;
            Newachievement.seen = false;
            if (Newachievement.achievement_id != 0 && (user.profile.user_Status == dto_1.UserStatus.Online || user.profile.user_Status == dto_1.UserStatus.InGame)) {
                Newachievement.seen = true;
            }
            const res = await this.achievementsRepository.save(Newachievement);
            if (res) {
                await this.profileGatewayService.EmitMessage(user.user_id, 'NewAchievement', { AchImage: Achievement.image, Achname: Achievement.name });
            }
        }
    }
    async ShowunsenAchievements(userId) {
        const res = await this.achievementsRepository.find({
            where: {
                Player: { user_id: userId },
                seen: false
            }
        });
        await await this.achievementsRepository.update({ Player: { user_id: userId }, seen: false }, { seen: true });
        if (res.length > 0) {
            await this.profileGatewayService.EmitMessage(userId, 'NewAchievement', { AchImage: res[res.length - 1].image, Achname: res[res.length - 1].name });
        }
    }
};
exports.AchievementsService = AchievementsService;
exports.AchievementsService = AchievementsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Achievements)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => profileGateway_service_1.ProfileGatewayService))),
    __metadata("design:paramtypes", [achievements_repository_1.AchievementsRepository,
        users_service_1.UsersService,
        profileGateway_service_1.ProfileGatewayService])
], AchievementsService);
//# sourceMappingURL=achievment.service.js.map