import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from 'src/users/services/users.service';

export type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void

const Middleware = (
    jwtService: JwtService, configService: ConfigService, usersService: UsersService
) => {
    return async (socket: Socket, next) => {

        try {
            const cookies = socket.handshake.headers.cookie.split(";").filter((data) => {
                return (data.includes("user_token"));
            });

            const token = cookies[0].trim();

            if (token) {
                const jwtService = new JwtService({
                    secret: configService.get<string>('JWT_SECRET')
                });

                const DecodedToken = jwtService.verify(token.substring(11));
                // const user = await usersService.user_data(DecodedToken.sub);
                socket.data.user = DecodedToken;
                next();
            } else {
                next(new UnauthorizedException("123456"));
            }
        } catch (e) {
            next(new UnauthorizedException("123456"));
        }
    }
}

@Injectable()
export class WsAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const client = context.switchToWs().getClient();


        return true;
    }
}

@WebSocketGateway({
    namespace: "/chat",
    cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true
    }
})

export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly usersService: UsersService
    ) { }

    @WebSocketServer()
    private server: Server;
    private static ClientsMap = new Map<number, Socket>();

    afterInit(client: Socket) {
        const middle = Middleware(this.jwtService, this.configService, this.usersService);
        client.use(middle as any);
    }

    handleConnection(client: any, ...args: any[]) {

        SocketGateway.ClientsMap.set(client.data.user.sub, client);
    }

    handleDisconnect(client: any) {
        SocketGateway.ClientsMap.delete(client.data.user.sub);
    }
}
