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
var NotLoggedInUser_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotLoggedInUser = exports.AlreadyLoggedInGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let NotLoggedInUser = NotLoggedInUser_1 = class NotLoggedInUser {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const respose = context.switchToHttp().getResponse();
        const token = NotLoggedInUser_1.extractJWT(request);
        if (token) {
            try {
                this.jwtService.verify(token, { secret: this.configService.get("JWT_SECRET") });
                respose.redirect(`${this.configService.get('FRONTEND_URL')}`);
                return false;
            }
            catch (err) {
                return true;
            }
        }
        return true;
    }
    static extractJWT(req) {
        if (req.cookies && 'user_token' in req.cookies) {
            const userToken = req.cookies.user_token;
            if (typeof userToken === 'string' && userToken.length > 0) {
                return userToken;
            }
        }
        return null;
    }
};
exports.NotLoggedInUser = NotLoggedInUser;
exports.NotLoggedInUser = NotLoggedInUser = NotLoggedInUser_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => jwt_1.JwtService))),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], NotLoggedInUser);
let AlreadyLoggedInGuard = class AlreadyLoggedInGuard {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const token = NotLoggedInUser.extractJWT(request);
        if (token) {
            try {
                this.jwtService.verify(token, { secret: this.configService.get("JWT_SECRET") });
                return true;
            }
            catch (err) {
                return false;
            }
        }
    }
};
exports.AlreadyLoggedInGuard = AlreadyLoggedInGuard;
exports.AlreadyLoggedInGuard = AlreadyLoggedInGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], AlreadyLoggedInGuard);
//# sourceMappingURL=auth.guard.js.map