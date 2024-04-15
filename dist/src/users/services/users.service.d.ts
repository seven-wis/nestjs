import { User, Profile, PlayProgress } from '../entities';
import { FriendShipRepository, ProfileRepository, StatisticRepository, UsersRepository } from 'src/utils/repositories';
import { AuthUserTdo } from 'src/utils/dto';
import { Match } from 'src/game/game.service';
import { GameHistory } from 'src/game/entities/game.entity';
import { PlayProgressRepository } from 'src/utils/repositories/playprogress.repository';
import { Statistics } from 'src/users/entities';
import { AchievementsService } from './achievment.service';
import { ProfileGatewayService } from 'src/websockets/profile-gateway/profileGateway.service';
export interface userDatashboad {
    user_id: number;
    user_name: string;
    user_avatar: string;
    user_Score: number;
}
export type achieve = {
    img: string;
    name: string;
    time: string;
    unlocked: boolean;
};
export type LevelInfo = {
    league: string;
    wins: number;
    loses: number;
    level: number;
    precLevel: number;
    MainLevelColor: string;
    BgLevelColor: string;
    achievement: achieve[];
};
export type UserStatistic = {
    time: string[];
    score: number[];
    matchs: number[];
};
export declare class UsersService {
    private readonly UsersRepo;
    private readonly FriendsRepo;
    private readonly ProfileRepo;
    private readonly PlayProgressRepo;
    private statisticRepository;
    private readonly profileGatewayService;
    private readonly acheivmentService;
    constructor(UsersRepo: UsersRepository, FriendsRepo: FriendShipRepository, ProfileRepo: ProfileRepository, PlayProgressRepo: PlayProgressRepository, statisticRepository: StatisticRepository, profileGatewayService: ProfileGatewayService, acheivmentService: AchievementsService);
    get_user_by_email(Email: string): Promise<{
        user: User;
        profile: Profile;
    }>;
    create_player_progress(): Promise<PlayProgress>;
    create_user_profile(user_data: AuthUserTdo): Promise<Profile>;
    create_new_user(user_data: AuthUserTdo): Promise<User>;
    user_data(user_id: number): Promise<User>;
    get_current_rooms(user_id: number): Promise<User>;
    update_bot_level(user_id: number, level: number): Promise<Profile>;
    update_level(user_id: number): Promise<PlayProgress>;
    add_new_score(user_id: number, score: number): Promise<PlayProgress>;
    update_user_statistic(user_id: number, winner: boolean): Promise<Statistics>;
    get_user_score(user_id: number): Promise<{
        user_id: number;
        score: number;
    }>;
    add_match(user_id: number, match: GameHistory): Promise<User | "done">;
    update_status(user_id: number, status: number): Promise<boolean>;
    get_leaderboard(): Promise<userDatashboad[]>;
    get_user_matches(user_id: number): Promise<Match[]>;
    get_achievements(user_id: number): Promise<achieve[]>;
    get_user_progress(user_id: number): Promise<LevelInfo>;
    get_user_statistics(user_id: number): Promise<UserStatistic>;
}
