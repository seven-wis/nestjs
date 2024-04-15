import { User } from "src/users/entities";
import { RoomsUsersRef } from "./rooms_users_ref.entity";
import { RoomMessage } from "./room_message.entity";
export declare class Room {
    room_id: number;
    room_name: string;
    room_type: string;
    room_password: string;
    owner: User;
    users: User[];
    roomsUsersRef: RoomsUsersRef[];
    messages: RoomMessage[];
}
