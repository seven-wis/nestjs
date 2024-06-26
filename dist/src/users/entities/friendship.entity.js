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
exports.Friendship = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const privatechat_entity_1 = require("../../chat/entities/privatechat.entity");
const uuid_1 = require("uuid");
let Friendship = class Friendship {
};
exports.Friendship = Friendship;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Friendship.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: (0, uuid_1.v4)() }),
    __metadata("design:type", String)
], Friendship.prototype, "friendshiptoekn", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.sentFriendRequests),
    (0, typeorm_1.JoinColumn)({ name: 'senderId' }),
    __metadata("design:type", user_entity_1.User)
], Friendship.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.receivedFriendRequests),
    (0, typeorm_1.JoinColumn)({ name: 'receiverId' }),
    __metadata("design:type", user_entity_1.User)
], Friendship.prototype, "receiver", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.friends),
    (0, typeorm_1.JoinColumn)({ name: 'friendId' }),
    __metadata("design:type", user_entity_1.User)
], Friendship.prototype, "friend", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'pending' }),
    __metadata("design:type", String)
], Friendship.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.blockedUsers),
    (0, typeorm_1.JoinColumn)({ name: 'blockedById' }),
    __metadata("design:type", user_entity_1.User)
], Friendship.prototype, "blockedBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => privatechat_entity_1.PrivateChat, chat => chat.friendship, { cascade: true, onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Friendship.prototype, "messages", void 0);
exports.Friendship = Friendship = __decorate([
    (0, typeorm_1.Entity)()
], Friendship);
//# sourceMappingURL=friendship.entity.js.map