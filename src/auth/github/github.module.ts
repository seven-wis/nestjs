import { Module, forwardRef } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { GithubStrategy } from '../strategies/github.strategy';
import { PassportModule } from '@nestjs/passport';
import { SharedModule } from 'src/utils/shared/shared.module';
import { UsersService } from 'src/users/services/users.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Friendship, Profile, PlayProgress, Achievements } from 'src/users/entities';
import { PrivateChatRepository } from 'src/utils/repositories';
import { PrivateChat } from 'src/chat/entities/privatechat.entity';
import { Statistics } from 'src/users/entities';
import { GameBetting } from 'src/users/entities/gamebetting.entity';
import { ProfileModule } from 'src/websockets/profile-gateway/profileGateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ User, Friendship, Profile, PrivateChat, PlayProgress, Statistics, Achievements, GameBetting]),
    PassportModule.register({ defaultStrategy: 'github' }),
    SharedModule,
    UsersModule,
    forwardRef(() => ProfileModule),
  ],
  controllers: [GithubController],
  providers: [GithubService, GithubStrategy, UsersService],
})
export class GithubModule {}
