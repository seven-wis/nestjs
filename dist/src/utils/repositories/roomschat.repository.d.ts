import { Repository } from 'typeorm';
import { Room } from 'src/chat/entities/room.entity';
import { RoomsUsersRef } from 'src/chat/entities/rooms_users_ref.entity';
import { RoomMessage } from 'src/chat/entities/room_message.entity';
import { Mute } from 'src/chat/entities/mute.entity';
export declare class RoomsChatRepository extends Repository<Room> {
}
export declare class RoomsUsersRefRepository extends Repository<RoomsUsersRef> {
}
export declare class RoomMessageRepository extends Repository<RoomMessage> {
}
export declare class MuteRepository extends Repository<Mute> {
}
