"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifModule = void 0;
const common_1 = require("@nestjs/common");
const notif_service_1 = require("./notif.service");
const notif_controller_1 = require("./notif.controller");
const typeorm_1 = require("@nestjs/typeorm");
const privatechat_entity_1 = require("../chat/entities/privatechat.entity");
const room_entity_1 = require("../chat/entities/room.entity");
const rooms_users_ref_entity_1 = require("../chat/entities/rooms_users_ref.entity");
const entities_1 = require("../users/entities");
const dto_1 = require("../utils/dto");
const shared_module_1 = require("../utils/shared/shared.module");
const notif_entity_1 = require("./entities/notif.entity");
const users_module_1 = require("../users/users.module");
const chat_module_1 = require("../chat/chat.module");
const profileGateway_module_1 = require("../websockets/profile-gateway/profileGateway.module");
const chat_gateway_module_1 = require("../websockets/chat-gateway/chat-gateway.module");
let NotifModule = class NotifModule {
};
exports.NotifModule = NotifModule;
exports.NotifModule = NotifModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([entities_1.User, entities_1.Friendship, entities_1.Profile, privatechat_entity_1.PrivateChat, room_entity_1.Room, rooms_users_ref_entity_1.RoomsUsersRef, dto_1.RoomMessage, notif_entity_1.Notifications]),
            shared_module_1.SharedModule,
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            (0, common_1.forwardRef)(() => chat_module_1.ChatModule),
            (0, common_1.forwardRef)(() => profileGateway_module_1.ProfileModule),
            (0, common_1.forwardRef)(() => chat_gateway_module_1.ChatGatewayModule),
        ],
        controllers: [notif_controller_1.NotifController],
        providers: [notif_service_1.NotifService],
        exports: [notif_service_1.NotifService]
    })
], NotifModule);
//# sourceMappingURL=notif.module.js.map