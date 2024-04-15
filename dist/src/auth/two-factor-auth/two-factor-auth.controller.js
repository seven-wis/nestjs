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
exports.TwoFactorAuthController = void 0;
const common_1 = require("@nestjs/common");
const two_factor_auth_service_1 = require("./two-factor-auth.service");
const userInfo_decorator_1 = require("../../utils/decorator/userInfo.decorator");
const auth_guard_1 = require("../../utils/guards/auth.guard");
let TwoFactorAuthController = class TwoFactorAuthController {
    constructor(twoFactorAuthService) {
        this.twoFactorAuthService = twoFactorAuthService;
    }
    async enableTwoFactorAuth(CurrentUser, response) {
        try {
            return await this.twoFactorAuthService.twoFactorAuthentication(CurrentUser.sub, response);
        }
        catch (error) {
            console.log(error);
        }
    }
    async enableTwoFactorAuthVerify(CurrentUser, body) {
        try {
            const token = body.token;
            const res = await this.twoFactorAuthService.enableTwoFactorAuthVerify(CurrentUser.sub, token);
            if (res) {
                return {
                    answer: true,
                    message: 'Two factor authentication enabled'
                };
            }
            throw new Error('Error while enabling two factor authentication');
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                answer: false,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async disableTwoFactorAuth(CurrentUser) {
        try {
            const res = await this.twoFactorAuthService.disableTwoFactorAuth(CurrentUser.sub);
            if (res) {
                return res;
            }
            throw new Error('Error while disabling two factor authentication');
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                answer: false,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    async verifyTwoFactorAuth(CurrentUser, body, response) {
        try {
            const token = body.token;
            const res = await this.twoFactorAuthService.verifyTwoFactorAuth(CurrentUser.sub, token, response);
            if (res) {
                response.cookie('user_token', res, {
                    expires: new Date(Date.now() + (24 * 60 * 60 * 1000)),
                    httpOnly: true,
                });
                response.send({
                    answer: true,
                    message: 'Two factor authentication enabled'
                });
            }
            throw new Error('Error while enabling two factor authentication');
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                answer: false,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
};
exports.TwoFactorAuthController = TwoFactorAuthController;
__decorate([
    (0, common_1.Get)('enable'),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Response]),
    __metadata("design:returntype", Promise)
], TwoFactorAuthController.prototype, "enableTwoFactorAuth", null);
__decorate([
    (0, common_1.Post)('enable-verify'),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TwoFactorAuthController.prototype, "enableTwoFactorAuthVerify", null);
__decorate([
    (0, common_1.Get)('disable'),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TwoFactorAuthController.prototype, "disableTwoFactorAuth", null);
__decorate([
    (0, common_1.Post)('verify'),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TwoFactorAuthController.prototype, "verifyTwoFactorAuth", null);
exports.TwoFactorAuthController = TwoFactorAuthController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.AlreadyLoggedInGuard),
    (0, common_1.Controller)('two-factor-auth'),
    __metadata("design:paramtypes", [two_factor_auth_service_1.TwoFactorAuthService])
], TwoFactorAuthController);
//# sourceMappingURL=two-factor-auth.controller.js.map