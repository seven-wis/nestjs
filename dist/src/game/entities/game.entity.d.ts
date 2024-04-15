import { User } from "src/users/entities";
import { GameHistoryResult, GameObject } from "../dto/game.dto";
export declare class GameHistory {
    id: number;
    MatchId: string;
    gameType: string;
    Player: User[];
    Player1: number;
    Player2: number;
    result: GameHistoryResult;
    matchRender: GameObject[];
    Winner: number;
    matchOver: boolean;
}
