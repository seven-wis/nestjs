import { Module, forwardRef } from '@nestjs/common';
import { NotifService } from './notif.service';
import { NotifController } from './notif.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivateChat } from 'src/chat/entities/privatechat.entity';
import { Room } from 'src/chat/entities/room.entity';
import { RoomsUsersRef } from 'src/chat/entities/rooms_users_ref.entity';
import { User, Friendship, Profile } from 'src/users/entities';
import { RoomMessage } from 'src/utils/dto';
import { SharedModule } from 'src/utils/shared/shared.module';
import { Notifications } from './entities/notif.entity';
import { UsersModule } from 'src/users/users.module';
import { ChatModule } from 'src/chat/chat.module';
import { ProfileModule } from 'src/websockets/profile-gateway/profileGateway.module';
import { ChatGatewayModule } from 'src/websockets/chat-gateway/chat-gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friendship, Profile, PrivateChat, Room, RoomsUsersRef, RoomMessage, Notifications]),
    SharedModule,
    forwardRef(() => UsersModule),
    forwardRef(() => ChatModule),
    forwardRef(() => ProfileModule),
    forwardRef(() => ChatGatewayModule),

  ],
  controllers: [NotifController],
  providers: [NotifService],
  exports: [NotifService]
})
export class NotifModule { }
