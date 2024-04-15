"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuteRepository = exports.RoomMessageRepository = exports.RoomsUsersRefRepository = exports.RoomsChatRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let RoomsChatRepository = class RoomsChatRepository extends typeorm_1.Repository {
};
exports.RoomsChatRepository = RoomsChatRepository;
exports.RoomsChatRepository = RoomsChatRepository = __decorate([
    (0, common_1.Injectable)()
], RoomsChatRepository);
class RoomsUsersRefRepository extends typeorm_1.Repository {
}
exports.RoomsUsersRefRepository = RoomsUsersRefRepository;
class RoomMessageRepository extends typeorm_1.Repository {
}
exports.RoomMessageRepository = RoomMessageRepository;
class MuteRepository extends typeorm_1.Repository {
}
exports.MuteRepository = MuteRepository;
//# sourceMappingURL=roomschat.repository.js.map