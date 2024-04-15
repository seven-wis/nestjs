import {
  PrivateChatRepository,
  FriendShipRepository,
  ProfileRepository,
  UsersRepository
} from '../utils/repositories';

import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from './entities/friendship.entity';
import { Profile } from './entities/profile.entity';
import { SharedModule } from '../utils/shared/shared.module';
import { UsersService } from './services/users.service';
import { BlockService } from './services/block.service';
import { FriendReqService } from './services/friendreq.service';
import { ProfileService } from './services/profile.service';
import { NotifModule } from 'src/notif/notif.module';
import { ProfileModule } from 'src/websockets/profile-gateway/profileGateway.module';
import { Achievements, PlayProgress } from './entities';
import { Statistics } from 'src/users/entities';
import { AchievementsService } from './services/achievment.service';
import { GameBetting } from './entities/gamebetting.entity';
import { BettingService } from './services/betting.service';
import { ChatGatewayModule } from 'src/websockets/chat-gateway/chat-gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Friendship,
      Profile,
      PlayProgress,
      Statistics,
      Achievements,
      GameBetting
      // PrivateChatRepository,
      // UsersRepository,
      // ProfileRepository,
      // FriendShipRepository
    ]),
    SharedModule,
    forwardRef(() => NotifModule),
    forwardRef(() => ProfileModule),
    forwardRef(() => ChatGatewayModule),
  ],
  controllers: [UsersController,],
  providers: [UsersService, BlockService, FriendReqService, ProfileService, AchievementsService, BettingService],
  exports: [UsersService, BlockService, FriendReqService, ProfileService, AchievementsService, BettingService],
})
export class UsersModule { }
