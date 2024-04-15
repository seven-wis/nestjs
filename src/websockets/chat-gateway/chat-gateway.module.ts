import { Module, forwardRef } from '@nestjs/common';
import { ChatGatewayService } from './chat-gateway.service';
import { ChatGateway } from './chat-gateway.gateway';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from 'src/chat/chat.module';

@Module({
    imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => ChatModule),
        JwtModule,
        ConfigModule,
    ],
    
    providers: [ChatGateway, ChatGatewayService],
    exports: [ChatGateway, ChatGatewayService]
})
export class ChatGatewayModule { }
