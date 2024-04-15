import { Module, forwardRef } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Friendship, Profile } from 'src/users/entities';
import { GameHistory } from './entities/game.entity';
import { SharedModule } from 'src/utils/shared/shared.module';
import { UsersModule } from 'src/users/users.module';
import { Statistics } from '../users/entities/statistics.entity';
import { ChatGatewayModule } from 'src/websockets/chat-gateway/chat-gateway.module';
import { ProfileModule } from 'src/websockets/profile-gateway/profileGateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameHistory, Statistics]),
    SharedModule,
    UsersModule,
    forwardRef(() => ProfileModule),
    forwardRef(() => ChatGatewayModule),
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule { }
