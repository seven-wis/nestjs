import { User } from "src/users/entities";
import { Room } from "./room.entity";
import { Mute } from "./mute.entity";
export declare class RoomsUsersRef {
    id: number;
    role: string;
    status: string;
    ref_token: string;
    user: User;
    room: Room;
    created_at: Date;
    mute: Mute;
    number_of_unread_messages: number;
}
