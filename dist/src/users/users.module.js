"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const users_controller_1 = require("./users.controller");
const user_entity_1 = require("./entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const friendship_entity_1 = require("./entities/friendship.entity");
const profile_entity_1 = require("./entities/profile.entity");
const shared_module_1 = require("../utils/shared/shared.module");
const users_service_1 = require("./services/users.service");
const block_service_1 = require("./services/block.service");
const friendreq_service_1 = require("./services/friendreq.service");
const profile_service_1 = require("./services/profile.service");
const notif_module_1 = require("../notif/notif.module");
const profileGateway_module_1 = require("../websockets/profile-gateway/profileGateway.module");
const entities_1 = require("./entities");
const entities_2 = require("./entities");
const achievment_service_1 = require("./services/achievment.service");
const gamebetting_entity_1 = require("./entities/gamebetting.entity");
const betting_service_1 = require("./services/betting.service");
const chat_gateway_module_1 = require("../websockets/chat-gateway/chat-gateway.module");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                friendship_entity_1.Friendship,
                profile_entity_1.Profile,
                entities_1.PlayProgress,
                entities_2.Statistics,
                entities_1.Achievements,
                gamebetting_entity_1.GameBetting
            ]),
            shared_module_1.SharedModule,
            (0, common_1.forwardRef)(() => notif_module_1.NotifModule),
            (0, common_1.forwardRef)(() => profileGateway_module_1.ProfileModule),
            (0, common_1.forwardRef)(() => chat_gateway_module_1.ChatGatewayModule),
        ],
        controllers: [users_controller_1.UsersController,],
        providers: [users_service_1.UsersService, block_service_1.BlockService, friendreq_service_1.FriendReqService, profile_service_1.ProfileService, achievment_service_1.AchievementsService, betting_service_1.BettingService],
        exports: [users_service_1.UsersService, block_service_1.BlockService, friendreq_service_1.FriendReqService, profile_service_1.ProfileService, achievment_service_1.AchievementsService, betting_service_1.BettingService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map