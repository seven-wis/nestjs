import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UsersService } from 'src/users/services/users.service';
export type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;
export declare class WsAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}
export declare class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly jwtService;
    private readonly configService;
    private readonly usersService;
    constructor(jwtService: JwtService, configService: ConfigService, usersService: UsersService);
    private server;
    private static ClientsMap;
    afterInit(client: Socket): void;
    handleConnection(client: any, ...args: any[]): void;
    handleDisconnect(client: any): void;
}
