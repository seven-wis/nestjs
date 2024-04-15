"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const Privatechat_service_1 = require("./services/Privatechat.service");
const chat_controller_1 = require("./chat.controller");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../users/entities");
const shared_module_1 = require("../utils/shared/shared.module");
const users_module_1 = require("../users/users.module");
const privatechat_entity_1 = require("./entities/privatechat.entity");
const roomschat_service_1 = require("./services/roomschat.service");
const room_entity_1 = require("./entities/room.entity");
const rooms_users_ref_entity_1 = require("./entities/rooms_users_ref.entity");
const room_message_entity_1 = require("./entities/room_message.entity");
const chat_gateway_module_1 = require("../websockets/chat-gateway/chat-gateway.module");
const notif_module_1 = require("../notif/notif.module");
const notif_entity_1 = require("../notif/entities/notif.entity");
const mute_entity_1 = require("./entities/mute.entity");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([entities_1.User, entities_1.Friendship, entities_1.Profile, privatechat_entity_1.PrivateChat, room_entity_1.Room, rooms_users_ref_entity_1.RoomsUsersRef, room_message_entity_1.RoomMessage, notif_entity_1.Notifications, mute_entity_1.Mute]),
            shared_module_1.SharedModule,
            (0, common_1.forwardRef)(() => chat_gateway_module_1.ChatGatewayModule),
            (0, common_1.forwardRef)(() => notif_module_1.NotifModule),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule)
        ],
        controllers: [chat_controller_1.ChatController],
        providers: [Privatechat_service_1.PrivateChatService, roomschat_service_1.RoomsChatService],
        exports: [Privatechat_service_1.PrivateChatService, roomschat_service_1.RoomsChatService]
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map