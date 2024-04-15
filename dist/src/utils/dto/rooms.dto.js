"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelType = exports.RoomMessage = exports.RoomInfo = void 0;
class RoomInfo {
}
exports.RoomInfo = RoomInfo;
class RoomMessage {
}
exports.RoomMessage = RoomMessage;
var ChannelType;
(function (ChannelType) {
    ChannelType[ChannelType["none"] = 0] = "none";
    ChannelType[ChannelType["publicChannel"] = 1] = "publicChannel";
    ChannelType[ChannelType["protectedChannel"] = 2] = "protectedChannel";
    ChannelType[ChannelType["privateChannel"] = 3] = "privateChannel";
    ChannelType[ChannelType["privateMessage"] = 4] = "privateMessage";
})(ChannelType || (exports.ChannelType = ChannelType = {}));
;
//# sourceMappingURL=rooms.dto.js.map