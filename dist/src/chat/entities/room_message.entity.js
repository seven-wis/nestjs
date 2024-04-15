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
exports.RoomMessage = void 0;
const typeorm_1 = require("typeorm");
const room_entity_1 = require("./room.entity");
const entities_1 = require("../../users/entities");
let RoomMessage = class RoomMessage {
};
exports.RoomMessage = RoomMessage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RoomMessage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RoomMessage.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], RoomMessage.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entities_1.User, user => user.sentMessages),
    __metadata("design:type", entities_1.User)
], RoomMessage.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => room_entity_1.Room, room => room.messages, { cascade: true, onDelete: 'CASCADE' }),
    __metadata("design:type", room_entity_1.Room)
], RoomMessage.prototype, "room", void 0);
exports.RoomMessage = RoomMessage = __decorate([
    (0, typeorm_1.Entity)()
], RoomMessage);
//# sourceMappingURL=room_message.entity.js.map