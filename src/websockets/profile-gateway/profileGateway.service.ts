import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ProfileGateway } from './profileGateway.gateway';
import { InjectRepository } from '@nestjs/typeorm';
import { GameBettingRepository } from 'src/utils/repositories/gamebetting.repository';
import { BettingService } from 'src/users/services/betting.service';
import { UsersService } from 'src/users/services/users.service';
import { AchievementsService } from 'src/users/services/achievment.service';

@Injectable()
export class ProfileGatewayService {
    constructor(
        @Inject(forwardRef(() => ProfileGateway)) private readonly profileGateway: ProfileGateway,
        @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
        @Inject(forwardRef(() => AchievementsService)) private readonly achievementsService: AchievementsService,
        private readonly bettingService: BettingService,
        
    ) { }

    async friend_ship_event_emitter(event: string, current_user_id: number, friend_id: number) {
        this.profileGateway.friend_ship_event_emitter(event, current_user_id, friend_id);
    }

    async notification_update(user_target_id: number) {
        this.profileGateway.notification_update(user_target_id);
    }

    async friend_Ship_event(user_event_sender: number, user_event_receiver: number) {
        this.profileGateway.friend_Ship_event(user_event_sender, user_event_receiver);
    }

    async game_betting(bettingObject: any) {
        return await this.bettingService.createBetting(bettingObject.current_user_id, bettingObject);
    }

    async EmitMessage(target: any, event: string, data: any) {
        this.profileGateway.EmitMessage(target, event, data);
    }

    async newAchievementUnlock(userId: number) {
        console.log("newAchievementUnlock");
        await this.achievementsService.ShowunsenAchievements(userId);
    }
}
