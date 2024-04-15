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
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const game_service_1 = require("./game.service");
const create_game_dto_1 = require("./dto/create-game.dto");
const auth_guard_1 = require("../utils/guards/auth.guard");
const swagger_1 = require("@nestjs/swagger");
let GameController = class GameController {
    constructor(gameService) {
        this.gameService = gameService;
    }
    async create_New_Game(createGameDto) {
        try {
            const res = await this.gameService.create_New_Game(createGameDto);
            if (res) {
                return res;
            }
            return "Error";
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async saveGame(result) {
        try {
            return await this.gameService.saveGame({
                gameInfo: result.gameInfo,
                result: result.result
            });
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async get() {
        try {
            return await this.gameService.getmatches();
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async getMatch(id) {
        try {
            return await this.gameService.getMatch(id);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
};
exports.GameController = GameController;
__decorate([
    (0, common_1.Post)("create_new_game"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_game_dto_1.CreateGameDto]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "create_New_Game", null);
__decorate([
    (0, common_1.Post)("save_game"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "saveGame", null);
__decorate([
    (0, common_1.Get)("/matchs"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GameController.prototype, "get", null);
__decorate([
    (0, common_1.Get)("/match/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getMatch", null);
exports.GameController = GameController = __decorate([
    (0, swagger_1.ApiTags)('game'),
    (0, common_1.UseGuards)(auth_guard_1.AlreadyLoggedInGuard),
    (0, common_1.Controller)('game'),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameController);
//# sourceMappingURL=game.controller.js.map