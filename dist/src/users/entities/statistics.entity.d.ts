import { User } from "src/users/entities";
export declare class Statistics {
    id: number;
    date: string;
    totalScore: number;
    totalMatches: number;
    totalWins: number;
    totalLoses: number;
    Player: User;
    constructor();
}
