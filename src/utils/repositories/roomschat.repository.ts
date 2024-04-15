import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Room } from 'src/chat/entities/room.entity';
import { RoomsUsersRef } from 'src/chat/entities/rooms_users_ref.entity';
import { RoomMessage } from 'src/chat/entities/room_message.entity';
import { Mute } from 'src/chat/entities/mute.entity';


@Injectable()
export class RoomsChatRepository extends Repository<Room> { }

export class RoomsUsersRefRepository extends Repository<RoomsUsersRef> { }

export class RoomMessageRepository extends Repository<RoomMessage> { }

export class MuteRepository extends Repository<Mute> { }