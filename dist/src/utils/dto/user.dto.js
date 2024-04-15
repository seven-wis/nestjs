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
exports.UserUpdatedDto = exports.userInfo = exports.InfoDto = exports.SendFriendRequestDto = exports.UserDto = exports.FriendshipStatus = exports.UserStatus = exports.AuthUserTdo = void 0;
const class_validator_1 = require("class-validator");
class AuthUserTdo {
}
exports.AuthUserTdo = AuthUserTdo;
var UserStatus;
(function (UserStatus) {
    UserStatus[UserStatus["Online"] = 0] = "Online";
    UserStatus[UserStatus["Offline"] = 1] = "Offline";
    UserStatus[UserStatus["InGame"] = 2] = "InGame";
    UserStatus[UserStatus["Walo"] = -1] = "Walo";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var FriendshipStatus;
(function (FriendshipStatus) {
    FriendshipStatus[FriendshipStatus["non"] = -1] = "non";
    FriendshipStatus[FriendshipStatus["Isfriend"] = 0] = "Isfriend";
    FriendshipStatus[FriendshipStatus["RequestSend"] = 1] = "RequestSend";
    FriendshipStatus[FriendshipStatus["RequestRecived"] = 2] = "RequestRecived";
})(FriendshipStatus || (exports.FriendshipStatus = FriendshipStatus = {}));
class UserDto {
}
exports.UserDto = UserDto;
class SendFriendRequestDto {
}
exports.SendFriendRequestDto = SendFriendRequestDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], SendFriendRequestDto.prototype, "receiverId", void 0);
class InfoDto {
}
exports.InfoDto = InfoDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], InfoDto.prototype, "friendId", void 0);
class userInfo {
}
exports.userInfo = userInfo;
class UserUpdatedDto {
}
exports.UserUpdatedDto = UserUpdatedDto;
//# sourceMappingURL=user.dto.js.map