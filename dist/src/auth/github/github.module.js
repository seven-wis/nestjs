"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubModule = void 0;
const common_1 = require("@nestjs/common");
const github_service_1 = require("./github.service");
const github_controller_1 = require("./github.controller");
const github_strategy_1 = require("../strategies/github.strategy");
const passport_1 = require("@nestjs/passport");
const shared_module_1 = require("../../utils/shared/shared.module");
const users_service_1 = require("../../users/services/users.service");
const users_module_1 = require("../../users/users.module");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../../users/entities");
const privatechat_entity_1 = require("../../chat/entities/privatechat.entity");
const entities_2 = require("../../users/entities");
const gamebetting_entity_1 = require("../../users/entities/gamebetting.entity");
const profileGateway_module_1 = require("../../websockets/profile-gateway/profileGateway.module");
let GithubModule = class GithubModule {
};
exports.GithubModule = GithubModule;
exports.GithubModule = GithubModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([entities_1.User, entities_1.Friendship, entities_1.Profile, privatechat_entity_1.PrivateChat, entities_1.PlayProgress, entities_2.Statistics, entities_1.Achievements, gamebetting_entity_1.GameBetting]),
            passport_1.PassportModule.register({ defaultStrategy: 'github' }),
            shared_module_1.SharedModule,
            users_module_1.UsersModule,
            (0, common_1.forwardRef)(() => profileGateway_module_1.ProfileModule),
        ],
        controllers: [github_controller_1.GithubController],
        providers: [github_service_1.GithubService, github_strategy_1.GithubStrategy, users_service_1.UsersService],
    })
], GithubModule);
//# sourceMappingURL=github.module.js.map