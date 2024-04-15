"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const extractJWT = (req) => {
    if (req.cookies && 'user_token' in req.cookies) {
        const userToken = req.cookies.user_token;
        if (typeof userToken === 'string' && userToken.length > 0) {
            return userToken;
        }
    }
    return null;
};
exports.CurrentUser = (0, common_1.createParamDecorator)((property, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const configService = new config_1.ConfigService();
    const token = extractJWT(request);
    if (token) {
        try {
            const jwtService = new jwt_1.JwtService({
                secret: configService.get('JWT_SECRET')
            });
            return jwtService.verify(token);
        }
        catch (err) {
            return null;
        }
    }
    return null;
});
//# sourceMappingURL=userInfo.decorator.js.map