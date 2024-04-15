import { CreateGameDto } from './dto/create-game.dto';
import { GameHistoryRepository, StatisticRepository } from 'src/utils/repositories';
import { GameHistory } from './entities/game.entity';
import { UsersService } from 'src/users/services/users.service';
import { BettingService } from 'src/users/services/betting.service';
import { ProfileGatewayService } from 'src/websockets/profile-gateway/profileGateway.service';
import { GameObject } from './dto/game.dto';
export interface Result {
    gameId: string;
    winner: number;
    loser: number;
    scoreWinner: number;
    scoreLoser: number;
}
export interface PlayerBody {
    userId: number;
    userName: string;
    userAvatar: string;
    userScode?: number;
}
export interface Match {
    id: number;
    MatchId: string;
    Player1: PlayerBody;
    Player2: PlayerBody;
    Winner: number;
    is_live: boolean;
    matchRendring?: GameObject[];
}
export declare class GameService {
    private gameHistoryRepository;
    private statisticRepository;
    private readonly usersService;
    private readonly bettingService;
    private readonly profileGatewayService;
    constructor(gameHistoryRepository: GameHistoryRepository, statisticRepository: StatisticRepository, usersService: UsersService, bettingService: BettingService, profileGatewayService: ProfileGatewayService);
    create_New_Game(createGameDto: CreateGameDto): Promise<GameHistory>;
    saveGame(data: {
        gameInfo: GameObject[];
        result: Result;
    }): Promise<string>;
    create(): Promise<GameHistory>;
    getmatches(): Promise<Match[]>;
    getMatch(match_id: number): Promise<GameObject[]>;
}
