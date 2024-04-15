"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModule = void 0;
const common_1 = require("@nestjs/common");
const game_service_1 = require("./game.service");
const game_controller_1 = require("./game.controller");
const typeorm_1 = require("@nestjs/typeorm");
const game_entity_1 = require("./entities/game.entity");
const shared_module_1 = require("../utils/shared/shared.module");
const users_module_1 = require("../users/users.module");
const statistics_entity_1 = require("../users/entities/statistics.entity");
const chat_gateway_module_1 = require("../websockets/chat-gateway/chat-gateway.module");
const profileGateway_module_1 = require("../websockets/profile-gateway/profileGateway.module");
let GameModule = class GameModule {
};
exports.GameModule = GameModule;
exports.GameModule = GameModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([game_entity_1.GameHistory, statistics_entity_1.Statistics]),
            shared_module_1.SharedModule,
            users_module_1.UsersModule,
            (0, common_1.forwardRef)(() => profileGateway_module_1.ProfileModule),
            (0, common_1.forwardRef)(() => chat_gateway_module_1.ChatGatewayModule),
        ],
        controllers: [game_controller_1.GameController],
        providers: [game_service_1.GameService],
    })
], GameModule);
//# sourceMappingURL=game.module.js.map