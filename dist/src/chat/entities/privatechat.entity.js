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
exports.PrivateChat = void 0;
const typeorm_1 = require("typeorm");
const entities_1 = require("../../users/entities");
let PrivateChat = class PrivateChat {
};
exports.PrivateChat = PrivateChat;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PrivateChat.prototype, "message_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_1.User, user => user.sentMessages),
    __metadata("design:type", entities_1.User)
], PrivateChat.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_1.User, user => user.receivedMessages),
    __metadata("design:type", entities_1.User)
], PrivateChat.prototype, "receiver", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_1.Friendship, friendship => friendship.messages, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'friendshipId' }),
    __metadata("design:type", entities_1.Friendship)
], PrivateChat.prototype, "friendship", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PrivateChat.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], PrivateChat.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], PrivateChat.prototype, "isRead", void 0);
exports.PrivateChat = PrivateChat = __decorate([
    (0, typeorm_1.Entity)()
], PrivateChat);
//# sourceMappingURL=privatechat.entity.js.map