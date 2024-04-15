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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const friendship_entity_1 = require("./friendship.entity");
const profile_entity_1 = require("./profile.entity");
const room_entity_1 = require("../../chat/entities/room.entity");
const rooms_users_ref_entity_1 = require("../../chat/entities/rooms_users_ref.entity");
const game_entity_1 = require("../../game/entities/game.entity");
const entities_1 = require("./");
const entities_2 = require("./");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], User.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "user_name", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => profile_entity_1.Profile, (profile) => profile.user),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", profile_entity_1.Profile)
], User.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => friendship_entity_1.Friendship, (friendship) => friendship.sender),
    __metadata("design:type", Array)
], User.prototype, "sentFriendRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => friendship_entity_1.Friendship, (friendship) => friendship.receiver),
    __metadata("design:type", Array)
], User.prototype, "receivedFriendRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => friendship_entity_1.Friendship, (friendship) => friendship.friend),
    __metadata("design:type", Array)
], User.prototype, "friends", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => friendship_entity_1.Friendship, (friendship) => friendship.blockedBy),
    __metadata("design:type", Array)
], User.prototype, "blockedUsers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => friendship_entity_1.Friendship, (friendship) => friendship.sender),
    __metadata("design:type", Array)
], User.prototype, "sentMessages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => friendship_entity_1.Friendship, (friendship) => friendship.receiver),
    __metadata("design:type", Array)
], User.prototype, "receivedMessages", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => room_entity_1.Room, room => room.users),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], User.prototype, "rooms", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => room_entity_1.Room, room => room.owner),
    __metadata("design:type", Array)
], User.prototype, "owned_rooms", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => rooms_users_ref_entity_1.RoomsUsersRef, roomsUsersRef => roomsUsersRef.user),
    __metadata("design:type", Array)
], User.prototype, "roomsUsersRef", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => game_entity_1.GameHistory, match => match.Player),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], User.prototype, "matches", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => entities_1.Statistics, Statistics => Statistics.Player),
    __metadata("design:type", Array)
], User.prototype, "Statistics", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => entities_2.Achievements, achievement => achievement.Player),
    __metadata("design:type", Array)
], User.prototype, "achievements", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
], User);
//# sourceMappingURL=user.entity.js.map