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
exports.TwoFactorAuthService = void 0;
const common_1 = require("@nestjs/common");
const otplib_1 = require("otplib");
const qrcode_1 = require("qrcode");
const profile_service_1 = require("../../users/services/profile.service");
const users_service_1 = require("../../users/services/users.service");
const jwt_1 = require("@nestjs/jwt");
let TwoFactorAuthService = class TwoFactorAuthService {
    constructor(profileService, usersService, jwtService) {
        this.profileService = profileService;
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async generateTwoFactorAuthenticationSecret(username) {
        const secret = otplib_1.authenticator.generateSecret();
        const otpauthUrl = otplib_1.authenticator.keyuri(username, "42", secret);
        return {
            secret,
            otpauthUrl,
        };
    }
    async pipeQrCodeStream(stream, otpauthUrl) {
        return (0, qrcode_1.toFileStream)(stream, otpauthUrl);
    }
    async twoFactorAuthentication(current_user_id, response) {
        const user = await this.profileService.get_user_profile(current_user_id);
        const { secret, otpauthUrl } = await this.generateTwoFactorAuthenticationSecret(user.name);
        if (secret && otpauthUrl) {
            const res = await this.profileService.add_two_factor_auth(current_user_id, secret, false);
            if (res) {
                return await this.pipeQrCodeStream(response, otpauthUrl);
            }
        }
        throw new Error('Error while enabling two factor authentication');
    }
    async enableTwoFactorAuthVerify(current_user_id, token) {
        const user = await this.usersService.user_data(current_user_id);
        const isValid = otplib_1.authenticator.verify({ token: token, secret: user.profile.twoFactSecret });
        console.table({
            user: user.profile.twoFactSecret,
            name: user.profile.user_firstName,
            token: token,
            isValid: isValid
        });
        if (isValid) {
            const res = await this.profileService.add_two_factor_auth(current_user_id, user.profile.twoFactSecret, true);
            if (res)
                return user;
        }
        throw new Error('Invalid token');
    }
    async disableTwoFactorAuth(current_user_id) {
        const res = await this.profileService.add_two_factor_auth(current_user_id, null, false);
        if (res)
            return {
                answer: true,
                message: 'Two factor authentication disabled'
            };
        throw new Error('Error while disabling two factor authentication');
    }
    async verifyTwoFactorAuth(current_user_id, token, response) {
        const user = await this.usersService.user_data(current_user_id);
        const isValid = otplib_1.authenticator.verify({ token: token, secret: user.profile.twoFactSecret });
        if (isValid) {
            const payload = {
                username: user.user_name,
                sub: user.user_id,
                _auth: true,
            };
            return this.jwtService.sign(payload);
        }
        throw new Error('Invalid token');
    }
};
exports.TwoFactorAuthService = TwoFactorAuthService;
__decorate([
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Response]),
    __metadata("design:returntype", Promise)
], TwoFactorAuthService.prototype, "twoFactorAuthentication", null);
exports.TwoFactorAuthService = TwoFactorAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [profile_service_1.ProfileService,
        users_service_1.UsersService,
        jwt_1.JwtService])
], TwoFactorAuthService);
//# sourceMappingURL=two-factor-auth.service.js.map