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
exports.RoomsUsersRef = void 0;
const entities_1 = require("../../users/entities");
const typeorm_1 = require("typeorm");
const room_entity_1 = require("./room.entity");
const mute_entity_1 = require("./mute.entity");
let RoomsUsersRef = class RoomsUsersRef {
};
exports.RoomsUsersRef = RoomsUsersRef;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RoomsUsersRef.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['owner', 'admin', 'member'], default: 'member' }),
    __metadata("design:type", String)
], RoomsUsersRef.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['active', 'invited', 'banned', 'muted'], default: 'active' }),
    __metadata("design:type", String)
], RoomsUsersRef.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RoomsUsersRef.prototype, "ref_token", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_1.User, user => user.roomsUsersRef),
    __metadata("design:type", entities_1.User)
], RoomsUsersRef.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => room_entity_1.Room, room => room.roomsUsersRef, { cascade: true, onDelete: 'CASCADE' }),
    __metadata("design:type", room_entity_1.Room)
], RoomsUsersRef.prototype, "room", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], RoomsUsersRef.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => mute_entity_1.Mute, mute => mute.mutedUser, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", mute_entity_1.Mute)
], RoomsUsersRef.prototype, "mute", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], RoomsUsersRef.prototype, "number_of_unread_messages", void 0);
exports.RoomsUsersRef = RoomsUsersRef = __decorate([
    (0, typeorm_1.Entity)()
], RoomsUsersRef);
//# sourceMappingURL=rooms_users_ref.entity.js.map