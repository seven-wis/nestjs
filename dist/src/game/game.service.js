"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const repositories_1 = require("../utils/repositories");
const game_entity_1 = require("./entities/game.entity");
const users_service_1 = require("../users/services/users.service");
const dto_1 = require("../utils/dto");
const statistics_entity_1 = require("../users/entities/statistics.entity");
const betting_service_1 = require("../users/services/betting.service");
const profileGateway_service_1 = require("../websockets/profile-gateway/profileGateway.service");
let GameService = class GameService {
    constructor(gameHistoryRepository, statisticRepository, usersService, bettingService, profileGatewayService) {
        this.gameHistoryRepository = gameHistoryRepository;
        this.statisticRepository = statisticRepository;
        this.usersService = usersService;
        this.bettingService = bettingService;
        this.profileGatewayService = profileGatewayService;
    }
    async create_New_Game(createGameDto) {
        const game = new game_entity_1.GameHistory();
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
            await this.usersService.update_status(createGameDto.id1, dto_1.UserStatus.InGame);
            await this.usersService.update_status(createGameDto.id2, dto_1.UserStatus.InGame);
            if (createGameDto.id1 != -1)
                await this.usersService.add_match(createGameDto.id1, game);
            if (createGameDto.id2 != -1)
                await this.usersService.add_match(createGameDto.id2, game);
            await this.profileGatewayService.EmitMessage("all", "matchUpdate", { game: "" });
        }
        return res;
    }
    async saveGame(data) {
        const gameRender = data.gameInfo;
        const gameData = await this.gameHistoryRepository.findOne({
            where: {
                MatchId: data.result.gameId
            }
        });
        if (gameData) {
            gameData.matchRender = gameRender;
            gameData.Winner = data.result.winner;
            gameData.matchOver = true;
            await this.usersService.update_status(data.result.loser, dto_1.UserStatus.Online);
            await this.usersService.update_status(data.result.winner, dto_1.UserStatus.Online);
            gameData.result = {
                Player1: { userId: data.result.winner, userScode: data.result.scoreWinner },
                Player2: { userId: data.result.loser, userScode: data.result.scoreLoser }
            };
            if (data.result.winner == -1 || data.result.loser == -1) {
                if (data.result.winner == -1) {
                    gameData.result = {
                        Player1: { userId: data.result.winner, userScode: data.result.scoreWinner },
                        Player2: { userId: data.result.loser, userScode: data.result.scoreLoser }
                    };
                }
                if (data.result.loser == -1) {
                    gameData.result = {
                        Player2: { userId: data.result.winner, userScode: data.result.scoreWinner },
                        Player1: { userId: data.result.loser, userScode: data.result.scoreLoser }
                    };
                }
            }
            const res = await this.gameHistoryRepository.update(gameData.id, gameData);
            if (res) {
                var AddScore;
                if (gameData.gameType == "onlineGame") {
                    AddScore = 10;
                }
                else {
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
                }, 500);
            }
        }
        return "done";
    }
    async create() {
        const game = new game_entity_1.GameHistory();
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
        };
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
        var matchs = [];
        if (all) {
            all.forEach((game) => {
                if (game.Player1 != -1 && game.Player2 != -1) {
                    if (game.id == 2) {
                        console.log("Game: ", game.Player, game.result);
                        console.log("Game: ", game.Player[0].user_id, game.Player[1].user_id);
                        console.log("Game: ", game.result.Player1.userId, game.result.Player2.userId);
                    }
                    var Player1 = {
                        userId: game.Player[0].user_id,
                        userName: game.Player[0].user_name,
                        userAvatar: game.Player[0].profile.user_avatar,
                        userScode: game.result.Player1.userId == game.Player[0].user_id ? game.result.Player1.userScode : game.result.Player2.userScode,
                    };
                    var Player2 = {
                        userId: game.Player[1].user_id,
                        userName: game.Player[1].user_name,
                        userAvatar: game.Player[1].profile.user_avatar,
                        userScode: game.result.Player2.userId == game.Player[1].user_id ? game.result.Player2.userScode : game.result.Player1.userScode,
                    };
                    if (Player1.userId != game.Winner) {
                        [Player1, Player2] = [Player2, Player1];
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
            });
        }
        return matchs;
    }
    ;
    async getMatch(match_id) {
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
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(game_entity_1.GameHistory)),
    __param(1, (0, typeorm_1.InjectRepository)(statistics_entity_1.Statistics)),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => profileGateway_service_1.ProfileGatewayService))),
    __metadata("design:paramtypes", [repositories_1.GameHistoryRepository,
        repositories_1.StatisticRepository,
        users_service_1.UsersService,
        betting_service_1.BettingService,
        profileGateway_service_1.ProfileGatewayService])
], GameService);
//# sourceMappingURL=game.service.js.map