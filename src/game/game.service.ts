import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GameHistoryRepository, StatisticRepository } from 'src/utils/repositories';
import { GameHistory } from './entities/game.entity';
import { UsersService } from 'src/users/services/users.service';
import { UserStatus } from 'src/utils/dto';
import { User } from 'src/users/entities';
import { Statistics } from '../users/entities/statistics.entity';
import { BettingService } from 'src/users/services/betting.service';
import { ChatGatewayService } from 'src/websockets/chat-gateway/chat-gateway.service';
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

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(GameHistory) private gameHistoryRepository: GameHistoryRepository,
        @InjectRepository(Statistics) private statisticRepository: StatisticRepository,
        private readonly usersService: UsersService,
        private readonly bettingService: BettingService,
        @Inject(forwardRef(() => ProfileGatewayService)) private readonly profileGatewayService: ProfileGatewayService,
    ) { }

    async create_New_Game(createGameDto: CreateGameDto) {

        const game = new GameHistory();
        game.MatchId = createGameDto.roomId;
        game.gameType = createGameDto.gameType;
        game.Player1 = createGameDto.id1;
        game.Player2 = createGameDto.id2;
        if (createGameDto.id1 == -1) {
            game.Player1 = -1;
            game.Player2 = createGameDto.id2;
        }

        if (createGameDto.id2 == -1) {
            game.Player1 = -1;
            game.Player2 = createGameDto.id1;
        }

        const res = await this.gameHistoryRepository.save(game);
        if (res) {
            await this.usersService.update_status(createGameDto.id1, UserStatus.InGame);
            await this.usersService.update_status(createGameDto.id2, UserStatus.InGame);

            if (createGameDto.id1 != -1)
                await this.usersService.add_match(createGameDto.id1, game);
            if (createGameDto.id2 != -1)
                await this.usersService.add_match(createGameDto.id2, game);
            await this.profileGatewayService.EmitMessage("all", "matchUpdate", { game: "" });

        }
        return res;
    }

    async saveGame(data: { gameInfo: GameObject[], result: Result }) {
        const gameRender: GameObject[] = data.gameInfo;


        const gameData = await this.gameHistoryRepository.findOne({
            where: {
                MatchId: data.result.gameId
            }
        });

        if (gameData) {
            gameData.matchRender = gameRender;
            gameData.Winner = data.result.winner;
            gameData.matchOver = true;

            await this.usersService.update_status(data.result.loser, UserStatus.Online);
            await this.usersService.update_status(data.result.winner, UserStatus.Online);

            gameData.result = {
                Player1: { userId: data.result.winner, userScode: data.result.scoreWinner },
                Player2: { userId: data.result.loser, userScode: data.result.scoreLoser }
            }

            if (data.result.winner == -1 || data.result.loser == -1) {
                if (data.result.winner == -1) {
                    gameData.result = {
                        Player1: { userId: data.result.winner, userScode: data.result.scoreWinner },
                        Player2: { userId: data.result.loser, userScode: data.result.scoreLoser }
                    }
                }

                if (data.result.loser == -1) {
                    gameData.result = {
                        Player2: { userId: data.result.winner, userScode: data.result.scoreWinner },
                        Player1: { userId: data.result.loser, userScode: data.result.scoreLoser }
                    }
                }
            }

            const res = await this.gameHistoryRepository.update(gameData.id, gameData);

            if (res) {
                var AddScore;

                if (gameData.gameType == "onlineGame") {
                    AddScore = 10;
                } else {
                    AddScore = 5;
                    if (data.result.winner != -1) {
                        await this.usersService.update_bot_level(data.result.winner, Math.abs(data.result.scoreLoser - data.result.scoreWinner));
                    }
                }

                if (data.result.winner != -1) {
                    const newScore = await this.usersService.add_new_score(data.result.winner, AddScore);
                    if (newScore) {
                        await this.usersService.update_user_statistic(data.result.winner, true);
                        await this.usersService.update_user_statistic(data.result.loser, false);
                        await this.bettingService.bet_calculator(gameData.id, data.result.winner);
                    }
                }

                setTimeout(async () => {
                    await this.profileGatewayService.EmitMessage("all", "matchOver", { game: "" });
                    await this.profileGatewayService.EmitMessage("all", "bettingDone", { game: "" });
                }, 500)
            }
        }

        return "done";
    }

    async create() {
        const game = new GameHistory();
        game.MatchId = "1";
        game.Player1 = 1;
        game.Player2 = 2;

        const GameObj = {
            player1: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                userName: "Player1",
                score: 0
            },
            player2: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                userName: "Player2",
                score: 0
            },
            ball: {
                x: 0,
                y: 0,
                radius: 0,
                speed: 0,
                velocityX: 0,
                velocityY: 0
            },
            gameID: "1",
            gameStatus: "active",
            gameWinner: "",
            gameLoser: ""
        }

        const matchRender = [];
        for (let i = 0; i < 40800; i++)
            matchRender.push(GameObj);

        game.matchRender = matchRender;

        return this.gameHistoryRepository.save(game);
    }

    async getmatches() {
        const all = await this.gameHistoryRepository.find({
            relations: ["Player", "Player.profile"],
            select: ["id", "MatchId", "Player1", "Player2", "Winner", "result", "matchOver", "Player"],
            order: {
                id: "DESC"
            }
        });

        var matchs: Match[] = [];
        if (all) {
            all.forEach((game) => {
                if (game.Player1 != -1 && game.Player2 != -1) {

                    if (game.id == 2) {
                        console.log("Game: ", game.Player, game.result);
                        console.log("Game: ", game.Player[0].user_id, game.Player[1].user_id);
                        console.log("Game: ", game.result.Player1.userId, game.result.Player2.userId);
                    }

                    var Player1: PlayerBody = {
                        userId: game.Player[0].user_id,
                        userName: game.Player[0].user_name,
                        userAvatar: game.Player[0].profile.user_avatar,
                        userScode: game.result.Player1.userId == game.Player[0].user_id ? game.result.Player1.userScode : game.result.Player2.userScode,
                    }

                    var Player2: PlayerBody = {
                        userId: game.Player[1].user_id,
                        userName: game.Player[1].user_name,
                        userAvatar: game.Player[1].profile.user_avatar,
                        userScode: game.result.Player2.userId == game.Player[1].user_id ? game.result.Player2.userScode : game.result.Player1.userScode,
                    }

                    // if (game.result.Player1.userId != game.Player1) {
                    //     Player1.userScode = game.result.Player2.userScode;
                    //     Player2.userScode = game.result.Player1.userScode;
                    // }

                    if (Player1.userId != game.Winner) {
                        [Player1, Player2] = [Player2, Player1]
                    }

                    console.log("Player1: ", Player1.userName, Player1.userScode, Player1.userId, game.Winner);

                    matchs.push({
                        id: game.id,
                        MatchId: game.MatchId,

                        Player1: (Player1),
                        Player2: (Player2),

                        Winner: game.Winner,
                        is_live: !game.matchOver
                    });
                }
            })
        }

        return matchs;
    };


    async getMatch(match_id: number) {
        const game = await this.gameHistoryRepository.findOne({
            where: {
                id: match_id
            },
            relations: ["Player", "Player.profile"]
        });

        if (game.matchRender && game.matchRender.length > 0) {
            return game.matchRender;
        }
    }
}
