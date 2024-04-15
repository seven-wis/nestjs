import { AchievementsRepository } from "src/utils/repositories/achievements.repository";
import { UsersService } from "./users.service";
import { ProfileGatewayService } from "src/websockets/profile-gateway/profileGateway.service";
export interface Achievement {
    id: number;
    name: string;
    image: string;
    Level_id: number;
}
export declare class AchievementsService {
    private achievementsRepository;
    private readonly usersService;
    private readonly profileGatewayService;
    constructor(achievementsRepository: AchievementsRepository, usersService: UsersService, profileGatewayService: ProfileGatewayService);
    getAchievements(): Promise<Achievement[]>;
    getConstAchievement(userId: number): Promise<Achievement>;
    createAchievement(userId: number, achievement_id: number): Promise<void>;
    ShowunsenAchievements(userId: number): Promise<void>;
}
