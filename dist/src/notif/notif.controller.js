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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifController = void 0;
const common_1 = require("@nestjs/common");
const notif_service_1 = require("./notif.service");
const userInfo_decorator_1 = require("../utils/decorator/userInfo.decorator");
const auth_guard_1 = require("../utils/guards/auth.guard");
let NotifController = class NotifController {
    constructor(notifService) {
        this.notifService = notifService;
    }
    getNotifications(CurrentUser) {
        try {
            return this.notifService.get_Current_Notifications(CurrentUser.sub);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
    processNotification(currentUser, data) {
        try {
            return this.notifService.process_Notification(currentUser.sub, data.notifId, data.event);
        }
        catch (e) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                message: e.message,
            }, common_1.HttpStatus.FORBIDDEN);
        }
    }
};
exports.NotifController = NotifController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotifController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Post)("process"),
    __param(0, (0, userInfo_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], NotifController.prototype, "processNotification", null);
exports.NotifController = NotifController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.AlreadyLoggedInGuard),
    (0, common_1.Controller)('notif'),
    __metadata("design:paramtypes", [notif_service_1.NotifService])
], NotifController);
//# sourceMappingURL=notif.controller.js.map