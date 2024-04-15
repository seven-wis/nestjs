"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const intra_module_1 = require("./auth/intra/intra.module");
const shared_module_1 = require("./utils/shared/shared.module");
const users_module_1 = require("./users/users.module");
const chat_module_1 = require("./chat/chat.module");
const profileGateway_module_1 = require("./websockets/profile-gateway/profileGateway.module");
const chat_gateway_module_1 = require("./websockets/chat-gateway/chat-gateway.module");
const notif_module_1 = require("./notif/notif.module");
const two_factor_auth_module_1 = require("./auth/two-factor-auth/two-factor-auth.module");
const github_module_1 = require("./auth/github/github.module");
const game_module_1 = require("./game/game.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            shared_module_1.SharedModule,
            intra_module_1.IntraModule,
            users_module_1.UsersModule,
            chat_module_1.ChatModule,
            profileGateway_module_1.ProfileModule,
            chat_gateway_module_1.ChatGatewayModule,
            notif_module_1.NotifModule,
            two_factor_auth_module_1.TwoFactorAuthModule,
            github_module_1.GithubModule,
            game_module_1.GameModule,
        ],
        controllers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map