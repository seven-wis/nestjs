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
exports.Room = void 0;
const entities_1 = require("../../users/entities");
const typeorm_1 = require("typeorm");
const rooms_users_ref_entity_1 = require("./rooms_users_ref.entity");
const room_message_entity_1 = require("./room_message.entity");
let Room = class Room {
};
exports.Room = Room;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Room.prototype, "room_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Room.prototype, "room_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['public', 'private', 'protected'], default: 'public' }),
    __metadata("design:type", String)
], Room.prototype, "room_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Room.prototype, "room_password", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_1.User, user => user.owned_rooms),
    __metadata("design:type", entities_1.User)
], Room.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => entities_1.User, user => user.rooms, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Room.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => rooms_users_ref_entity_1.RoomsUsersRef, roomsUsersRef => roomsUsersRef.room),
    __metadata("design:type", Array)
], Room.prototype, "roomsUsersRef", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => room_message_entity_1.RoomMessage, roomMessage => roomMessage.room),
    __metadata("design:type", Array)
], Room.prototype, "messages", void 0);
exports.Room = Room = __decorate([
    (0, typeorm_1.Entity)()
], Room);
//# sourceMappingURL=room.entity.js.map