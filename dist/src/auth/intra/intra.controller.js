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
exports.HomeController = exports.IntraController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const intra_service_1 = require("./intra.service");
const auth_guard_1 = require("../../utils/guards/auth.guard");
const passport_1 = require("@nestjs/passport");
const dto_1 = require("../../utils/dto");
const userInfo_decorator_1 = require("../../utils/decorator/userInfo.decorator");
const swagger_1 = require("@nestjs/swagger");
let IntraController = class IntraController {
    constructor(configService, intraService) {
        this.configService = configService;
        this.intraService = intraService;
    }
    async IntraLogin() {
        const res = this.configService.get('INTRA_REDIRECT_URI');
        const resp = await this.intraService.IntraLogin();
        return ("42 intra login");
    }
    async intacallback(req, res) {
        const jwtToekn = await this.intraService.intaCallback(req.user);
        res.cookie('user_token', jwtToekn, {
            expires: new Date(Date.now() + (24 * 60 * 60 * 1000)),
            httpOnly: true,
        });
        res.redirect(`${this.configService.get('FRONTEND_URL')}`);
    }
    async logout(Currentuser, req, res) {
        res.clearCookie('user_token');
        res.clearCookie('jwt');
        await this.intraService.userLogout(Currentuser.sub);
        res.send('logout done');
    }
    isloggedin(Currentuser) {
        if (Currentuser._auth == null || Currentuser._auth == true) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.OK
            }, common_1.HttpStatus.OK);
        }
        if (Currentuser._auth == false) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.UNAUTHORIZED,
            }, common_1.HttpStatus.UNAUTHORIZED);
        }
    }
};
exports.IntraController = IntraController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.NotLoggedInUser, (0, passport_1.AuthGuard)('42')),
    (0, common_1.Get)("42"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IntraController.prototype, "IntraLogin", null);
__decorate([
    (0, common_1.Get)("42/callback"),
    (0, common_1.UseGuards)(auth_guard_1.NotLoggedInUser, (0, passport_1.AuthGuard)('42')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IntraController.prototype, "intacallback", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AlreadyLoggedInGuard),
    (0, common_1.Get)("logout"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.userInfo, Object, Object]),
    __metadata("design:returntype", Promise)
], IntraController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AlreadyLoggedInGuard),
    (0, common_1.Get)("isloggedin"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntraController.prototype, "isloggedin", null);
exports.IntraController = IntraController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        intra_service_1.IntraService])
], IntraController);
let HomeController = class HomeController {
    constructor(configService, intraService) {
        this.configService = configService;
        this.intraService = intraService;
    }
    async home(user) {
        return user;
    }
};
exports.HomeController = HomeController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AlreadyLoggedInGuard),
    (0, common_1.Get)("home"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "home", null);
exports.HomeController = HomeController = __decorate([
    (0, common_1.Controller)(""),
    __metadata("design:paramtypes", [config_1.ConfigService,
        intra_service_1.IntraService])
], HomeController);
//# sourceMappingURL=intra.controller.js.map