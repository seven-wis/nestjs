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
exports.Statistics = void 0;
const entities_1 = require("./");
const typeorm_1 = require("typeorm");
let Statistics = class Statistics {
    constructor() {
        this.date = new Date().toISOString();
        this.totalLoses = 0;
        this.totalMatches = 0;
        this.totalScore = 0;
        this.totalWins = 0;
    }
};
exports.Statistics = Statistics;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Statistics.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Statistics.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Statistics.prototype, "totalScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Statistics.prototype, "totalMatches", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Statistics.prototype, "totalWins", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Statistics.prototype, "totalLoses", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_1.User, user => user.Statistics, { cascade: true, onDelete: 'CASCADE' }),
    __metadata("design:type", entities_1.User)
], Statistics.prototype, "Player", void 0);
exports.Statistics = Statistics = __decorate([
    (0, typeorm_1.Entity)(),
    __metadata("design:paramtypes", [])
], Statistics);
//# sourceMappingURL=statistics.entity.js.map