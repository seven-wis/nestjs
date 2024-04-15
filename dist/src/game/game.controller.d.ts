import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
export declare class GameController {
    private readonly gameService;
    constructor(gameService: GameService);
    create_New_Game(createGameDto: CreateGameDto): Promise<import("./entities/game.entity").GameHistory | "Error">;
    saveGame(result: any): Promise<string>;
    get(): Promise<import("./game.service").Match[]>;
    getMatch(id: number): Promise<import("./dto/game.dto").GameObject[]>;
}
