import { Module } from '@nestjs/common';
import { IntraModule } from './auth/intra/intra.module';
import { SharedModule } from './utils/shared/shared.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { SocketGateway } from './websockets/socket.gateway';
import { ProfileModule } from './websockets/profile-gateway/profileGateway.module';
import { ChatGatewayModule } from './websockets/chat-gateway/chat-gateway.module';
import { NotifModule } from './notif/notif.module';
import { APP_FILTER } from '@nestjs/core';
import { TwoFactorAuthModule } from './auth/two-factor-auth/two-factor-auth.module';
import { GithubModule } from './auth/github/github.module';
import { GameModule } from './game/game.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    SharedModule,
    IntraModule,
    UsersModule,
    ChatModule,
    ProfileModule,
    ChatGatewayModule,
    NotifModule,
    TwoFactorAuthModule,
    GithubModule,
    GameModule,

    // HttpModule.register({
    //   maxBodyLength: 100 * 1024 * 1024 // 10mb
    // }),
  
  ],
  controllers: [],
  // providers: [
  //   SocketGateway,
  //   {
  //     provide: APP_FILTER,
  //     useClass: HttpExceptionFilter,
  //   },
  // ],
})
export class AppModule { }
