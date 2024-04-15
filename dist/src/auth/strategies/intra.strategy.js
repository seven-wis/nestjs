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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntraStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_42_1 = require("passport-42");
const config_1 = require("@nestjs/config");
let IntraStrategy = class IntraStrategy extends (0, passport_1.PassportStrategy)(passport_42_1.Strategy, '42') {
    constructor(configService) {
        super({
            clientID: configService.get('INTRA_APP_ID'),
            clientSecret: configService.get('INTRA_APP_SECRET'),
            callbackURL: configService.get('INTRA_REDIRECT_URI'),
            Scope: ["profile"]
        });
        this.configService = configService;
    }
    async validate(accessToken, refreshToken, profile, done) {
        const user = {
            AccessToken: accessToken,
            Id: profile.id,
            Username: profile.username,
            Email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
            Image: profile._json.image.link,
            FirstName: profile.name.familyName,
            LastName: profile.name.givenName
        };
        return done(null, user);
    }
};
exports.IntraStrategy = IntraStrategy;
exports.IntraStrategy = IntraStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], IntraStrategy);
//# sourceMappingURL=intra.strategy.js.map