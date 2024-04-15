import { User } from "./user.entity";
export declare class Achievements {
    id: number;
    achievement_id: number;
    name: string;
    image: string;
    time: string;
    seen: boolean;
    count: number;
    Player: User;
}
