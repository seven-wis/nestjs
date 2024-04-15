import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Achievements } from "../entities";
import { AchievementsRepository } from "src/utils/repositories/achievements.repository";
import { UsersService } from "./users.service";
import { ACHIEVEMENTS_NAMES, ACHIEVEMENT_LIST } from "src/utils/constant/achievement.constant";
import { ProfileGatewayService } from "src/websockets/profile-gateway/profileGateway.service";
import { UserStatus } from "src/utils/dto";

export interface Achievement {
    id: number;
    name: string;
    image: string;
    Level_id: number;
}

@Injectable()
export class AchievementsService {
    constructor(
        @InjectRepository(Achievements) private achievementsRepository: AchievementsRepository,
        @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
        @Inject(forwardRef(() => ProfileGatewayService)) private readonly profileGatewayService: ProfileGatewayService,

    ) { }

    async getAchievements() {
        return ACHIEVEMENT_LIST;
    }

    async getConstAchievement(userId: number) {
        return ACHIEVEMENT_LIST.filter(achievement => achievement.Level_id === userId)[0] || null;
    }

    async createAchievement(userId: number, achievement_id: number) {
        const Achievement = await this.getConstAchievement(achievement_id);

        console.log(" Achievement: ", Achievement);

        if (Achievement) {
            const user = await this.usersService.user_data(userId);

            const Newachievement = new Achievements();
            Newachievement.achievement_id = Achievement.id;
            Newachievement.image = Achievement.image;
            Newachievement.name = Achievement.name;
            Newachievement.time = new Date().toISOString().split('T')[0];
            Newachievement.Player = user;
            Newachievement.seen = false;
            if (Newachievement.achievement_id != 0 && (user.profile.user_Status == UserStatus.Online || user.profile.user_Status == UserStatus.InGame)) {
                Newachievement.seen = true;
            }
            const res = await this.achievementsRepository.save(Newachievement);
            if (res) {
                await this.profileGatewayService.EmitMessage(user.user_id, 'NewAchievement', { AchImage: Achievement.image, Achname: Achievement.name });
            }
        }
    }

    async ShowunsenAchievements(userId: number) {
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
}