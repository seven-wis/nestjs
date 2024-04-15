"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGatewayModule = void 0;
const common_1 = require("@nestjs/common");
const chat_gateway_service_1 = require("./chat-gateway.service");
const chat_gateway_gateway_1 = require("./chat-gateway.gateway");
const users_module_1 = require("../../users/users.module");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const chat_module_1 = require("../../chat/chat.module");
let ChatGatewayModule = class ChatGatewayModule {
};
exports.ChatGatewayModule = ChatGatewayModule;
exports.ChatGatewayModule = ChatGatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            (0, common_1.forwardRef)(() => chat_module_1.ChatModule),
            jwt_1.JwtModule,
            config_1.ConfigModule,
        ],
        providers: [chat_gateway_gateway_1.ChatGateway, chat_gateway_service_1.ChatGatewayService],
        exports: [chat_gateway_gateway_1.ChatGateway, chat_gateway_service_1.ChatGatewayService]
    })
], ChatGatewayModule);
//# sourceMappingURL=chat-gateway.module.js.map