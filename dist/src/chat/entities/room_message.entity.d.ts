import { Room } from "./room.entity";
import { User } from "src/users/entities";
export declare class RoomMessage {
    id: number;
    message: string;
    timestamp: Date;
    sender: User;
    room: Room;
}
