import { Module, forwardRef } from '@nestjs/common';
import { PrivateChatService } from './services/Privatechat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship, Profile, User } from '../users/entities';
import { SharedModule } from '../utils/shared/shared.module';
import { UsersModule } from '../users/users.module';
import { PrivateChat } from './entities/privatechat.entity';
import { RoomsChatService } from './services/roomschat.service';
import { Room } from './entities/room.entity';
import { RoomsUsersRef } from './entities/rooms_users_ref.entity';
import { RoomMessage } from './entities/room_message.entity';
import { ChatGatewayModule } from 'src/websockets/chat-gateway/chat-gateway.module';
import { NotifModule } from 'src/notif/notif.module';
import { Notifications } from 'src/notif/entities/notif.entity';
import { Mute } from './entities/mute.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friendship, Profile, PrivateChat, Room, RoomsUsersRef, RoomMessage, Notifications, Mute]),
    SharedModule,
    forwardRef(() => ChatGatewayModule),
    forwardRef(() => NotifModule),
    forwardRef(() => UsersModule)
  ],
  controllers: [ChatController],
  providers: [PrivateChatService, RoomsChatService],
  exports: [PrivateChatService, RoomsChatService]
})
export class ChatModule { }
