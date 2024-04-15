import { RoomsUsersRef } from "./rooms_users_ref.entity";
export declare class Mute {
    id: number;
    mute_user_id: number;
    mute_room_id: number;
    mute_time: number;
    mutedUser: RoomsUsersRef;
    created_at: Date;
}
