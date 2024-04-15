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
exports.BettingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const gamebetting_entity_1 = require("../entities/gamebetting.entity");
const gamebetting_repository_1 = require("../../utils/repositories/gamebetting.repository");
const users_service_1 = require("./users.service");
const profileGateway_service_1 = require("../../websockets/profile-gateway/profileGateway.service");
let BettingService = class BettingService {
    constructor(bettingRepository, usersService, profileGatewayService) {
        this.bettingRepository = bettingRepository;
        this.usersService = usersService;
        this.profileGatewayService = profileGatewayService;
    }
    async createBetting(userId, bettingObject) {
        console.log("createBetting -> betObj : ", bettingObject);
        const user = await this.usersService.user_data(userId);
        if (user) {
            const betting = await this.bettingRepository.find({
                where: {
                    userId: user.user_id,
                    gameId: bettingObject.gameId,
                    status: 'pending',
                },
            });
            console.log("createBetting -> betting : ", betting.length, userId);
            if (betting.length == 0) {
                if (user.profile && user.profile.score >= bettingObject.bettingValue) {
                    const newBetting = new gamebetting_entity_1.GameBetting();
                    newBetting.userId = user.user_id;
                    newBetting.gameId = bettingObject.gameId;
                    newBetting.bettingValue = bettingObject.bettingValue;
                    newBetting.betOn = bettingObject.betOn;
                    newBetting.status = 'pending';
                    const bettingRes = await this.bettingRepository.save(newBetting);
                    if (bettingRes) {
                        await this.usersService.add_new_score(user.user_id, bettingObject.bettingValue * -1);
                        await this.profileGatewayService.EmitMessage("all", "bettingDone", { game: "" });
                        await this.profileGatewayService.EmitMessage("all", "matchOver", { game: "" });
                    }
                }
            }
        }
    }
    async bet_calculator(gameId, winner) {
        const betting = await this.bettingRepository.find({
            where: {
                gameId: gameId,
                status: 'pending',
            },
        });
        if (betting.length > 0) {
            await this.bettingRepository.update({ gameId: gameId }, { status: 'done' });
            var allBetValue = 0;
            var winnerBetValue = 0;
            var winBetters = [];
            for (let i = 0; i < betting.length; i++) {
                if (betting[i].betOn == winner) {
                    winnerBetValue += betting[i].bettingValue;
                    winBetters.push(betting[i]);
                }
                allBetValue += betting[i].bettingValue;
            }
            console.log("bet_calculator -> winBetters : ", winBetters);
            console.log("bet_calculator -> winner : ", winner);
            winBetters.forEach(async (bet) => {
                const bettingPercent = Math.floor(bet.bettingValue / winnerBetValue) * 100;
                const newScore = Math.floor((bettingPercent / 100) * allBetValue);
                const user = await this.usersService.user_data(bet.userId);
                if (user) {
                    await this.usersService.add_new_score(bet.userId, newScore);
                }
            });
            await this.profileGatewayService.EmitMessage("all", "matchOver", { game: "" });
        }
    }
};
exports.BettingService = BettingService;
exports.BettingService = BettingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gamebetting_entity_1.GameBetting)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => profileGateway_service_1.ProfileGatewayService))),
    __metadata("design:paramtypes", [gamebetting_repository_1.GameBettingRepository,
        users_service_1.UsersService,
        profileGateway_service_1.ProfileGatewayService])
], BettingService);
//# sourceMappingURL=betting.service.js.map