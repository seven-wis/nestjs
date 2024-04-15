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
exports.IntraService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const dto_1 = require("../../utils/dto");
const users_service_1 = require("../../users/services/users.service");
let IntraService = class IntraService {
    constructor(jwtService, usersService) {
        this.jwtService = jwtService;
        this.usersService = usersService;
    }
    async IntraLogin() {
        return ("IntraLogin xx");
    }
    async intaCallback(UserAuthInfo) {
        var user_data = await this.usersService.get_user_by_email(UserAuthInfo.Email);
        if (!user_data.user) {
            user_data.user = await this.usersService.create_new_user(UserAuthInfo);
            user_data.profile = user_data.user.profile;
        }
        const payload = {
            username: user_data.user.user_name,
            sub: user_data.user.user_id,
            _auth: user_data.profile.twoFactAuth == true ? false : null,
        };
        await this.usersService.update_status(payload.sub, dto_1.UserStatus.Online);
        return this.jwtService.sign(payload);
    }
    async userLogout(userId) {
        await this.usersService.update_status(userId, dto_1.UserStatus.Offline);
    }
};
exports.IntraService = IntraService;
exports.IntraService = IntraService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        users_service_1.UsersService])
], IntraService);
//# sourceMappingURL=intra.service.js.map