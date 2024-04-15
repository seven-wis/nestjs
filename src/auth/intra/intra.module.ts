import { Module, forwardRef } from '@nestjs/common';
import { IntraController, HomeController } from './intra.controller';
import { IntraService } from './intra.service';
import { SharedModule } from 'src/utils/shared/shared.module';
import { PassportModule } from '@nestjs/passport';
import { IntraStrategy } from '../strategies';
import { UsersModule } from 'src/users/users.module';
import { User, Friendship, Profile, PlayProgress, Achievements} from 'src/users/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/services/users.service';
import { PrivateChatRepository } from 'src/utils/repositories';
import { PrivateChat } from 'src/chat/entities/privatechat.entity';
import { Statistics } from 'src/users/entities';
import { GameBetting } from 'src/users/entities/gamebetting.entity';
import { ProfileModule } from 'src/websockets/profile-gateway/profileGateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ User, Friendship, Profile, PrivateChat, PlayProgress, Statistics, Achievements, GameBetting]),
    PassportModule.register({ defaultStrategy: '42' }),
    UsersModule,
    SharedModule,
    forwardRef(() => ProfileModule),

  ],
  exports: [PassportModule],
  controllers: [IntraController, HomeController],
  providers: [IntraStrategy, IntraService, UsersService],
})

export class IntraModule { }
