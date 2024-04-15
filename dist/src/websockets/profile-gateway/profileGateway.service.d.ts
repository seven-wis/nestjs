import { ProfileGateway } from './profileGateway.gateway';
import { BettingService } from 'src/users/services/betting.service';
import { UsersService } from 'src/users/services/users.service';
import { AchievementsService } from 'src/users/services/achievment.service';
export declare class ProfileGatewayService {
    private readonly profileGateway;
    private readonly usersService;
    private readonly achievementsService;
    private readonly bettingService;
    constructor(profileGateway: ProfileGateway, usersService: UsersService, achievementsService: AchievementsService, bettingService: BettingService);
    friend_ship_event_emitter(event: string, current_user_id: number, friend_id: number): Promise<void>;
    notification_update(user_target_id: number): Promise<void>;
    friend_Ship_event(user_event_sender: number, user_event_receiver: number): Promise<void>;
    game_betting(bettingObject: any): Promise<void>;
    EmitMessage(target: any, event: string, data: any): Promise<void>;
    newAchievementUnlock(userId: number): Promise<void>;
}
