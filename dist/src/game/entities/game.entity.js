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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameHistory = void 0;
const entities_1 = require("../../users/entities");
const typeorm_1 = require("typeorm");
let GameHistory = class GameHistory {
};
exports.GameHistory = GameHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GameHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GameHistory.prototype, "MatchId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GameHistory.prototype, "gameType", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => entities_1.User, user => user.matches, { cascade: true, onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], GameHistory.prototype, "Player", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], GameHistory.prototype, "Player1", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], GameHistory.prototype, "Player2", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { default: { Player1: { userId: 0, userScore: 0 }, Player2: { userId: 0, userScore: 0 } } }),
    __metadata("design:type", Object)
], GameHistory.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Array)
], GameHistory.prototype, "matchRender", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], GameHistory.prototype, "Winner", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], GameHistory.prototype, "matchOver", void 0);
exports.GameHistory = GameHistory = __decorate([
    (0, typeorm_1.Entity)()
], GameHistory);
//# sourceMappingURL=game.entity.js.map