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
exports.GithubController = void 0;
const common_1 = require("@nestjs/common");
const github_service_1 = require("./github.service");
const passport_1 = require("@nestjs/passport");
const auth_guard_1 = require("../../utils/guards/auth.guard");
const config_1 = require("@nestjs/config");
let GithubController = class GithubController {
    constructor(githubService, configService) {
        this.githubService = githubService;
        this.configService = configService;
    }
    async githubLogin() {
        return ("github login");
    }
    async githubcallback(req, res) {
        const jwtToekn = await this.githubService.githubCallback(req.user);
        res.cookie('user_token', jwtToekn, {
            expires: new Date(Date.now() + (24 * 60 * 60 * 1000)),
            httpOnly: true,
        });
        res.redirect(`${this.configService.get('FRONTEND_URL')}`);
    }
};
exports.GithubController = GithubController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.NotLoggedInUser, (0, passport_1.AuthGuard)('github')),
    (0, common_1.Get)("github"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GithubController.prototype, "githubLogin", null);
__decorate([
    (0, common_1.Get)("github/callback"),
    (0, common_1.UseGuards)(auth_guard_1.NotLoggedInUser, (0, passport_1.AuthGuard)('github')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GithubController.prototype, "githubcallback", null);
exports.GithubController = GithubController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [github_service_1.GithubService,
        config_1.ConfigService])
], GithubController);
//# sourceMappingURL=github.controller.js.map