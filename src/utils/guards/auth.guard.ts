import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, HttpException, HttpStatus, Inject, forwardRef, } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';


@Injectable()
class NotLoggedInUser implements CanActivate {
  constructor(
    // private jwtService: JwtService,
    @Inject(forwardRef(() => JwtService)) private readonly jwtService: JwtService,

    private readonly configService: ConfigService,
  ) { }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const respose = context.switchToHttp().getResponse<Response>();
    const token = NotLoggedInUser.extractJWT(request);

    if (token) {
      try {
        this.jwtService.verify(token, { secret: this.configService.get<string>("JWT_SECRET") });
        respose.redirect(`${this.configService.get<string>('FRONTEND_URL')}`);
        return false;
      } catch (err) {
        return true;
      }
    }

    return true;
  }

  static extractJWT(req: Request): string | undefined {
    if (req.cookies && 'user_token' in req.cookies) {
      const userToken = req.cookies.user_token;
      if (typeof userToken === 'string' && userToken.length > 0) {
        return userToken;
      }
    }
    return null;
  }
}


@Injectable()
class  AlreadyLoggedInGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }

  canActivate(context: ExecutionContext): Observable<boolean> | Promise<boolean> | boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const token = NotLoggedInUser.extractJWT(request);

    // const client = context.switchToWs().getClient();
    // // const cookieHeader = client.handshake.headers.cookie;
    



    if (token) {
      try {
        this.jwtService.verify(token, { secret: this.configService.get<string>("JWT_SECRET") });
        return true;
      } catch (err) {
        return false;
      }
    }
  }
}

export { AlreadyLoggedInGuard, NotLoggedInUser }