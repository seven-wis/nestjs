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
var SocketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketGateway = exports.WsAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const users_service_1 = require("../users/services/users.service");
const Middleware = (jwtService, configService, usersService) => {
    return async (socket, next) => {
        try {
            const cookies = socket.handshake.headers.cookie.split(";").filter((data) => {
                return (data.includes("user_token"));
            });
            const token = cookies[0].trim();
            if (token) {
                const jwtService = new jwt_1.JwtService({
                    secret: configService.get('JWT_SECRET')
                });
                const DecodedToken = jwtService.verify(token.substring(11));
                socket.data.user = DecodedToken;
                next();
            }
            else {
                next(new common_1.UnauthorizedException("123456"));
            }
        }
        catch (e) {
            next(new common_1.UnauthorizedException("123456"));
        }
    };
};
let WsAuthGuard = class WsAuthGuard {
    canActivate(context) {
        const client = context.switchToWs().getClient();
        return true;
    }
};
exports.WsAuthGuard = WsAuthGuard;
exports.WsAuthGuard = WsAuthGuard = __decorate([
    (0, common_1.Injectable)()
], WsAuthGuard);
let SocketGateway = SocketGateway_1 = class SocketGateway {
    constructor(jwtService, configService, usersService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.usersService = usersService;
    }
    afterInit(client) {
        const middle = Middleware(this.jwtService, this.configService, this.usersService);
        client.use(middle);
    }
    handleConnection(client, ...args) {
        SocketGateway_1.ClientsMap.set(client.data.user.sub, client);
    }
    handleDisconnect(client) {
        SocketGateway_1.ClientsMap.delete(client.data.user.sub);
    }
};
exports.SocketGateway = SocketGateway;
SocketGateway.ClientsMap = new Map();
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SocketGateway.prototype, "server", void 0);
exports.SocketGateway = SocketGateway = SocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: "/chat",
        cors: {
            origin: [process.env.FRONTEND_URL],
            credentials: true
        }
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        users_service_1.UsersService])
], SocketGateway);
//# sourceMappingURL=socket.gateway.js.map