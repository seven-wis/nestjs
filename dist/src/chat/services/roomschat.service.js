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
exports.RoomsChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = require("bcrypt");
const profile_service_1 = require("../../users/services/profile.service");
const users_service_1 = require("../../users/services/users.service");
const roomschat_repository_1 = require("../../utils/repositories/roomschat.repository");
const uuid_1 = require("uuid");
const room_entity_1 = require("../entities/room.entity");
const room_message_entity_1 = require("../entities/room_message.entity");
const rooms_users_ref_entity_1 = require("../entities/rooms_users_ref.entity");
const chat_gateway_service_1 = require("../../websockets/chat-gateway/chat-gateway.service");
const friendreq_service_1 = require("../../users/services/friendreq.service");
const notif_service_1 = require("../../notif/notif.service");
const mute_entity_1 = require("../entities/mute.entity");
let RoomsChatService = class RoomsChatService {
    constructor(roomRepository, roomsUsersRefRepository, roomMessageRepository, chatGatewayService, friendReqService, userService, profileService, notifService, muteRepository) {
        this.roomRepository = roomRepository;
        this.roomsUsersRefRepository = roomsUsersRefRepository;
        this.roomMessageRepository = roomMessageRepository;
        this.chatGatewayService = chatGatewayService;
        this.friendReqService = friendReqService;
        this.userService = userService;
        this.profileService = profileService;
        this.notifService = notifService;
        this.muteRepository = muteRepository;
    }
    async createRoom(roomInfo) {
        const user = await this.userService.get_current_rooms(roomInfo.current_user_id);
        if (user) {
            const room = new room_entity_1.Room();
            room.room_name = roomInfo.roomName;
            room.room_type = roomInfo.roomType;
            room.room_password = roomInfo.roomPassword;
            room.owner = user;
            switch (roomInfo.roomType) {
                case 'public':
                    room.room_password = null;
                    break;
                case 'private':
                    room.room_password = null;
                    break;
                case 'protected':
                    room.room_password = await bcrypt.hash(roomInfo.roomPassword, 10);
                    break;
            }
            const newRoom = await this.roomRepository.save(room);
            if (newRoom) {
                await this.AddUserToRoom(newRoom.room_id, user.user_id, user.user_id, 'owner', 'add');
                newRoom.users = [user];
                return {
                    roomId: newRoom.room_id,
                    roomName: newRoom.room_name,
                    ChannelType: (newRoom.room_type == 'public') ? 1 : (newRoom.room_type == 'protected') ? 2 : (newRoom.room_type == 'private') ? 3 : 0,
                    ownerAvatar: newRoom.owner.profile.user_avatar,
                    numberOfMembers: newRoom.users.length,
                    owner: newRoom.owner.user_id,
                    InRoom: false,
                    LastMessageTime: String(""),
                    UnReadedCount: 0,
                };
            }
            throw new Error('Resource not found');
        }
    }
    async getRooms(current_user_id) {
        const currentUser = await this.userService.get_current_rooms(current_user_id);
        const rooms = await this.roomRepository.find({
            relations: ['owner', 'owner.profile', 'users', 'messages'],
            order: {
                messages: {
                    id: 'DESC'
                }
            }
        });
        let RoomsInfo = [];
        for (const room of rooms) {
            let InRoom = false;
            if (room.users && room.users.find(r => r.user_id == current_user_id))
                InRoom = true;
            const roomUsersRef = await this.roomsUsersRefRepository.findOne({
                where: [
                    { room: { room_id: room.room_id }, user: { user_id: currentUser.user_id } }
                ],
                relations: ['user']
            });
            if ((room && room.room_type == 'private' && !InRoom) || (roomUsersRef && roomUsersRef.status == 'banned'))
                continue;
            RoomsInfo.push({
                roomId: room.room_id,
                roomName: room.room_name,
                ChannelType: (room.room_type == 'public') ? 1 : (room.room_type == 'protected') ? 2 : (room.room_type == 'private') ? 3 : 0,
                ownerAvatar: room.owner.profile.user_avatar,
                numberOfMembers: room.users.length,
                owner: room.owner.user_id,
                InRoom: InRoom,
                TimeOfLastMessage: (InRoom && room.messages && room.messages.length > 0) ? room.messages[0].timestamp.toISOString() : "",
                UnreadMessagesCount: (InRoom && roomUsersRef) ? roomUsersRef.number_of_unread_messages : 0,
                users: (InRoom) ? await this.getRoomMembers(room.room_id, current_user_id) : null,
            });
        }
        return RoomsInfo;
    }
    async getRoomInfo(room_id) {
        return await this.roomRepository.findOne({
            where: [{ room_id: room_id }],
            relations: ['users', 'users.profile', 'owner']
        });
    }
    async AddUserToRoom(room_id, curent_user_id, new_user_id, roll, event = 'add') {
        const CurrentUser = await this.userService.get_current_rooms(curent_user_id);
        const NewUser = await this.userService.get_current_rooms(new_user_id);
        const room = await this.getRoomInfo(room_id);
        if (CurrentUser && NewUser && room) {
            const newUserRef = await this.roomsUsersRefRepository.findOne({
                where: [{ room: { room_id: room.room_id }, user: { user_id: NewUser.user_id } }],
                relations: ['user']
            });
            if (!newUserRef && ('add' == event || 'invite' == event)) {
                if (!room.users)
                    room.users = [];
                room.users.push(NewUser);
                if ((await this.roomRepository.save(room))) {
                    const roomUsersRef = new rooms_users_ref_entity_1.RoomsUsersRef();
                    roomUsersRef.mute = null;
                    roomUsersRef.room = room;
                    roomUsersRef.user = NewUser;
                    roomUsersRef.status = 'active';
                    roomUsersRef.role = roll;
                    roomUsersRef.ref_token = (0, uuid_1.v4)();
                    const mute = await this.muteRepository.findOne({
                        where: [{ mute_user_id: NewUser.user_id, mute_room_id: room.room_id }],
                        relations: ['mutedUser']
                    });
                    if (mute) {
                        roomUsersRef.mute = mute;
                        roomUsersRef.status = 'muted';
                    }
                    if ('private' === room.room_type && 'invite' == event) {
                        roomUsersRef.status = 'invited';
                    }
                    return await this.roomsUsersRefRepository.save(roomUsersRef);
                }
            }
            else if (newUserRef && event == 'invite') {
                newUserRef.status = 'invited';
                return await this.roomsUsersRefRepository.save(newUserRef);
            }
        }
        return null;
    }
    async do_event_by_token(current_user_id, notif_id, userRef_token, event) {
        const user = await this.userService.get_current_rooms(current_user_id);
        const userRef = await this.roomsUsersRefRepository.findOne({
            where: [{ ref_token: userRef_token }],
            relations: ['user', 'room']
        });
        if (user && userRef) {
            if (userRef.status == 'invited' && event == 'Accept') {
                userRef.status = 'active';
                const res = await this.roomsUsersRefRepository.save(userRef);
                if (res) {
                    await this.notifService.update_NotificationById(current_user_id, notif_id, 'read');
                    this.chatGatewayService.EmitMessage("chat", "roomUpdated", {});
                    if (res) {
                        return {
                            res,
                            message: `Request accepted successfully`
                        };
                    }
                }
            }
            else if (userRef.status == 'invited' && event == 'Reject') {
                const room = await this.getRoomInfo(userRef.room.room_id);
                const JoinTableid = room.users.findIndex(r => r.user_id == user.user_id);
                if (JoinTableid != -1) {
                    room.users.splice(JoinTableid, 1);
                    await this.roomRepository.save(room);
                }
                const res = await this.roomsUsersRefRepository.remove(userRef);
                if (res) {
                    await this.notifService.delete_NotificationById(current_user_id, notif_id);
                    if (res) {
                        return {
                            res,
                            message: `Request rejected successfully`
                        };
                    }
                }
            }
        }
        throw new Error('Resource not found');
    }
    async acceptInviteToRoom(current_user_id, room_id) {
        const user = await this.userService.get_current_rooms(current_user_id);
        const room = await this.getRoomInfo(room_id);
        if (user && room) {
            const userRef = await this.roomsUsersRefRepository.findOne({
                where: [{ room: { room_id: room.room_id }, user: { user_id: user.user_id } }],
                relations: ['user']
            });
            if (userRef && userRef.status == 'invited') {
                userRef.status = 'active';
                const res = await this.roomsUsersRefRepository.save(userRef);
                if (res) {
                    const notif = await this.notifService.get_NotificationByNotif_target(userRef.ref_token);
                    if (notif) {
                        await this.notifService.update_NotificationById(current_user_id, notif.id, 'read');
                    }
                    return res;
                }
            }
        }
        throw new Error('Resource not found');
    }
    async inviteFriendToRoom(current_user_id, room_id, invited_user_id) {
        const CurrentUser = await this.userService.get_current_rooms(current_user_id);
        const invitedUser = await this.userService.get_current_rooms(invited_user_id);
        const room = await this.getRoomInfo(room_id);
        if (CurrentUser && invitedUser && room) {
            const friendShip = await this.friendReqService.getFriendShip(CurrentUser.user_id, invitedUser.user_id);
            if (friendShip && friendShip.status == 'accepted') {
                const CurrentUserRef = await this.roomsUsersRefRepository.findOne({
                    where: [{ room: { room_id: room.room_id }, user: { user_id: CurrentUser.user_id } }],
                    relations: ['user']
                });
                if (CurrentUserRef && CurrentUserRef.status == 'active' && CurrentUserRef.role != 'member' && room.room_type == 'private') {
                    const invitedUserRef = await this.roomsUsersRefRepository.findOne({
                        where: [{ room: { room_id: room.room_id }, user: { user_id: invitedUser.user_id } }],
                        relations: ['user']
                    });
                    if (!invitedUserRef) {
                        const res = await this.AddUserToRoom(room.room_id, CurrentUser.user_id, invitedUser.user_id, 'member', 'invite');
                        if (res) {
                            this.notifService.create_Notification(current_user_id, {
                                notif_user_id: invitedUser.user_id,
                                notif_avatar: CurrentUser.profile.user_avatar,
                                notif_description: `${CurrentUser.user_name} invited you to ${room.room_name}`,
                                notif_title: 'Room Invitation',
                                notif_type: 'roomInvit',
                                notif_status: 'unread',
                                notif_target: res.ref_token
                            });
                            return res;
                        }
                    }
                }
            }
        }
        throw new Error('Action cannot be performed');
    }
    async JoinRoom(current_user_id, room_id, password = null, roll) {
        const user = await this.userService.get_current_rooms(current_user_id);
        const room = await this.getRoomInfo(room_id);
        if (user && room) {
            if (room.users && room.users.find(r => r.user_id == current_user_id)) {
                throw new Error('User already in the room');
            }
            if ('protected' === room.room_type) {
                try {
                    const passwordMatched = await bcrypt.compare(password, room.room_password);
                    if (passwordMatched) {
                        return await this.AddUserToRoom(room.room_id, current_user_id, user.user_id, roll, 'add');
                    }
                }
                catch (e) {
                    throw new Error('Invalid Password');
                }
                throw new Error('Invalid Password');
            }
            else {
                const res = await this.AddUserToRoom(room.room_id, current_user_id, user.user_id, roll, 'add');
                const socketId = await this.chatGatewayService.GetUserSocket(user.user_id);
                if (socketId) {
                    this.chatGatewayService.EmitMessage(socketId.id, 'newMemberRoom', {});
                }
            }
        }
    }
    async checkMuteStatus(userRef) {
        const CurrentTime = new Date();
        const mute = await this.muteRepository.findOne({
            where: [{ mute_user_id: userRef.user.user_id, mute_room_id: userRef.room.room_id }],
            relations: ['mutedUser']
        });
        if (mute) {
            if (Math.floor((CurrentTime.getTime() / 1000) - (mute.created_at.getTime() / 1000)) > mute.mute_time) {
                userRef.status = 'active';
                await this.muteRepository.remove(mute);
                userRef.mute = null;
                const res = await this.roomsUsersRefRepository.save(userRef);
                if (res) {
                    return null;
                }
            }
            else {
                return Math.floor(mute.mute_time - ((CurrentTime.getTime() / 1000) - (mute.created_at.getTime() / 1000)));
            }
        }
    }
    async getRoomMembers(room_id, user_id) {
        const user = await this.userService.get_current_rooms(user_id);
        if (user && user.rooms && user.rooms.find(r => r.room_id == room_id)) {
            const room = await this.getRoomInfo(room_id);
            if (room) {
                const CurrentUserRef = await this.roomsUsersRefRepository.findOne({
                    where: [{ room: { room_id: room.room_id }, user: { user_id: user.user_id } }],
                    relations: ['user', 'mute']
                });
                const Users = [];
                for (let user of room.users) {
                    const userRef = await this.roomsUsersRefRepository.findOne({
                        where: [{ room: { room_id: room.room_id }, user: { user_id: user.user_id } }],
                        relations: ['user', 'room', 'mute']
                    });
                    if (!userRef)
                        continue;
                    const Friendship = await this.friendReqService.getFriendShip(user.user_id, user_id);
                    let mute;
                    if (((CurrentUserRef && CurrentUserRef.status == 'active' && CurrentUserRef.role != 'member') || CurrentUserRef.id == userRef.id) && userRef.mute != null) {
                        mute = await this.checkMuteStatus(userRef);
                    }
                    Users.push({
                        id: user.user_id,
                        name: (Friendship && Friendship.status == 'blocked') ? "Blocked" : user.user_name,
                        currentAvatar: (Friendship && Friendship.status == 'blocked') ? "https://www.shareicon.net/data/2017/05/30/886556_user_512x512.png" : user.profile.user_avatar,
                        roll: userRef.role,
                        IsFriend: (Friendship && Friendship.status == 'accepted') ? true : false,
                        RoomStatus: (mute) ? "muted" : (CurrentUserRef.role == 'admin' || CurrentUserRef.role == 'owner' || CurrentUserRef.user.user_id == userRef.user.user_id) ? userRef.status : "",
                        muted_time: mute
                    });
                }
                return Users;
            }
            return [];
        }
        throw new Error('Resource not found');
    }
    async createRoomMessage(room_id, user_id, message) {
        const user = await this.userService.get_current_rooms(user_id);
        if (user) {
            const room = await this.getRoomInfo(room_id);
            if (room) {
                const userRef = await this.roomsUsersRefRepository.findOne({
                    where: [{ room: { room_id: room.room_id }, user: { user_id: user.user_id } }],
                    relations: ['user']
                });
                if (room && userRef && userRef.status === 'active') {
                    const roomMessage = new room_message_entity_1.RoomMessage();
                    roomMessage.message = message;
                    roomMessage.room = room;
                    roomMessage.sender = user;
                    const Message = await this.roomMessageRepository.save(roomMessage);
                    return {
                        messageId: Message.id,
                        userId: Message.sender.user_id,
                        userName: Message.sender.user_name,
                        userAvatar: Message.sender.profile.user_avatar,
                        time: "",
                        fullTime: Message.timestamp.toISOString(),
                        message: Message.message
                    };
                }
                throw new Error('Resource not found 0');
            }
            throw new Error('Resource not found 1');
        }
        throw new Error('Resource not found 2');
    }
    async updateUserRef_number_of_unread_messages(userRef_id, room_id) {
        const userRef = await this.roomsUsersRefRepository.findOne({
            where: [{ room: { room_id: room_id }, user: { user_id: userRef_id } }],
            relations: ['user']
        });
        if (userRef) {
            userRef.number_of_unread_messages += 1;
            return await this.roomsUsersRefRepository.save(userRef);
        }
    }
    async getRoomMessages(room_id, user_id) {
        const user = await this.userService.get_current_rooms(user_id);
        if (user) {
            const room = await this.getRoomInfo(room_id);
            if (room) {
                const userRef = await this.roomsUsersRefRepository.findOne({
                    where: [{ room: { room_id: room.room_id }, user: { user_id: user.user_id } }],
                    relations: ['user']
                });
                userRef.number_of_unread_messages = 0;
                await this.roomsUsersRefRepository.save(userRef);
                if (room && userRef && userRef.status != 'invited' && userRef.status != 'banned') {
                    const roomInfo = await this.roomRepository.findOne({
                        where: [{ room_id: room_id }],
                        relations: ['messages', 'messages.sender', 'messages.sender.profile']
                    });
                    const messages = [];
                    for (let message of roomInfo.messages) {
                        const Friendship = await this.friendReqService.getFriendShip(message.sender.user_id, user_id);
                        messages.push({
                            messageId: message.id,
                            userId: message.sender.user_id,
                            userName: (Friendship && Friendship.status == 'blocked') ? "User" : message.sender.user_name,
                            userAvatar: (Friendship && Friendship.status == 'blocked') ? "https://www.shareicon.net/data/2017/05/30/886556_user_512x512.png" : message.sender.profile.user_avatar,
                            time: message.timestamp.toISOString().split('T')[1].split('.')[0].split(':').slice(0, 2).join(':'),
                            fullTime: message.timestamp.toISOString(),
                            message: message.message
                        });
                    }
                    return messages;
                }
            }
            throw new Error('Resource not found');
        }
        throw new Error('Resource not found');
    }
    async banUserFromRoom(current_user_id, room_id, banned_user_id) {
        const user = await this.userService.get_current_rooms(current_user_id);
        const bannedUser = await this.userService.get_current_rooms(banned_user_id);
        if (user && bannedUser) {
            const room = await this.getRoomInfo(room_id);
            if (room) {
                if (room.users && room.users.find(r => r.user_id == current_user_id) && room.users.find(r => r.user_id == banned_user_id)) {
                    const CurrentuserRef = await this.roomsUsersRefRepository.findOne({
                        where: [{ room: { room_id: room.room_id }, user: { user_id: user.user_id } }],
                        relations: ['user']
                    });
                    const bannedUserRef = await this.roomsUsersRefRepository.findOne({
                        where: [{ room: { room_id: room.room_id }, user: { user_id: bannedUser.user_id } }],
                        relations: ['user']
                    });
                    if (CurrentuserRef && CurrentuserRef.role != 'member' && bannedUserRef && bannedUserRef.role != 'owner') {
                        bannedUserRef.status = 'banned';
                        return await this.roomsUsersRefRepository.save(bannedUserRef);
                    }
                    throw new Error('Action cannot be performed');
                }
            }
            throw new Error('Resource not found');
        }
    }
    async UnbanUserFromRoom(current_user_id, room_id, banned_user_id) {
        const user = await this.userService.get_current_rooms(current_user_id);
        const bannedUser = await this.userService.get_current_rooms(banned_user_id);
        if (user && bannedUser) {
            const room = await this.getRoomInfo(room_id);
            if (room.users && room.users.find(r => r.user_id == current_user_id) && room.users.find(r => r.user_id == banned_user_id)) {
                const CurrentuserRef = await this.roomsUsersRefRepository.findOne({
                    where: [{ room: { room_id: room.room_id }, user: { user_id: user.user_id } }],
                    relations: ['user']
                });
                const bannedUserRef = await this.roomsUsersRefRepository.findOne({
                    where: [{ room: { room_id: room.room_id }, user: { user_id: bannedUser.user_id } }],
                    relations: ['user']
                });
                if (CurrentuserRef && CurrentuserRef.role != 'member' && CurrentuserRef.status == 'active' && bannedUserRef && bannedUserRef.status == 'banned' && bannedUserRef.role != 'owner') {
                    this.leaveRoom(banned_user_id, room_id);
                }
            }
        }
    }
    async kickUserFromRoom(current_user_id, room_id, kicked_user_id) {
        const user = await this.userService.get_current_rooms(current_user_id);
        const kickedUser = await this.userService.get_current_rooms(kicked_user_id);
        if (user && kickedUser) {
            const room = await this.getRoomInfo(room_id);
            if (room) {
                if (room.users && room.users.find(r => r.user_id == current_user_id) && room.users.find(r => r.user_id == kicked_user_id)) {
                    const CurrentuserRef = await this.roomsUsersRefRepository.findOne({
                        where: [{ room: room, user: user }],
                        relations: ['user']
                    });
                    const kickedUserRef = await this.roomsUsersRefRepository.findOne({
                        where: [{ room: { room_id: room.room_id }, user: { user_id: kickedUser.user_id } }],
                        relations: ['user']
                    });
                    if (CurrentuserRef && CurrentuserRef.role != 'member' && kickedUserRef && kickedUserRef.role != 'owner') {
                        this.leaveRoom(kicked_user_id, room_id);
                    }
                }
            }
        }
    }
    async leaveRoom(current_user_id, room_id, owner_check = true) {
        const user = await this.userService.get_current_rooms(current_user_id);
        if (user) {
            const room = await this.getRoomInfo(room_id);
            if (room && room.users) {
                if (owner_check) {
                    if (room.owner.user_id == current_user_id) {
                        throw new Error('Owner cannot leave the room');
                    }
                }
                const joinTableIndex = room.users.findIndex(r => r.user_id == current_user_id);
                if (joinTableIndex != -1) {
                    room.users.splice(joinTableIndex, 1);
                    if (await this.roomRepository.save(room)) {
                        const userRef = await this.roomsUsersRefRepository.findOne({
                            where: [{ room: { room_id: room_id }, user: { user_id: current_user_id } }],
                            relations: ['user']
                        });
                        if (userRef) {
                            return await this.roomsUsersRefRepository.remove(userRef);
                        }
                    }
                }
            }
        }
        return null;
    }
    async SetAdminSatatus(current_user_id, room_id, admin_user_to_set_id, MemberStatus) {
        const CurrentUser = await this.userService.get_current_rooms(current_user_id);
        const NewadminUser = await this.userService.get_current_rooms(admin_user_to_set_id);
        if (CurrentUser && NewadminUser) {
            const CurrentUserRef = await this.roomsUsersRefRepository.findOne({
                where: [{ room: { room_id: room_id }, user: { user_id: CurrentUser.user_id } }],
                relations: ['user']
            });
            if (CurrentUserRef && (CurrentUserRef.role == 'owner' || CurrentUserRef.role == 'admin')) {
                const NewadminUserRef = await this.roomsUsersRefRepository.findOne({
                    where: [{ room: { room_id: room_id }, user: { user_id: NewadminUser.user_id } }],
                    relations: ['user']
                });
                if (((MemberStatus == 'admin' && NewadminUserRef && NewadminUserRef.role == 'member') || (MemberStatus == 'member' && NewadminUserRef && NewadminUserRef.role == 'admin')) && NewadminUserRef && NewadminUserRef.status == 'active') {
                    NewadminUserRef.role = MemberStatus;
                    return await this.roomsUsersRefRepository.save(NewadminUserRef);
                }
            }
        }
        throw new Error('Resource not found');
    }
    async updateRoomInfo(roomInfo) {
        const user = await this.userService.get_current_rooms(roomInfo.current_user_id);
        if (user) {
            const userRef = await this.roomsUsersRefRepository.findOne({
                where: [{ room: { room_id: roomInfo.roomId }, user: { user_id: user.user_id } }],
                relations: ['user']
            });
            if (userRef && (userRef.role == 'owner' || userRef.role == 'admin') && userRef.status == 'active') {
                const room = await this.roomRepository.findOne({
                    where: [{ room_id: roomInfo.roomId }],
                    relations: ['users']
                });
                room.room_name = roomInfo.roomName;
                room.room_type = roomInfo.roomType;
                room.room_password = await bcrypt.hash(roomInfo.roomPassword, 10);
                return await this.roomRepository.save(room);
            }
        }
    }
    async deleteRoom(current_user_id, roomId) {
        const user = await this.userService.get_current_rooms(current_user_id);
        if (user) {
            const userRef = await this.roomsUsersRefRepository.findOne({
                where: [{ room: { room_id: roomId }, user: { user_id: user.user_id } }],
                relations: ['user']
            });
            if (userRef && userRef.role == 'owner' && userRef.status == 'active') {
                const room = await this.roomRepository.findOne({
                    where: [{ room_id: roomId }],
                    relations: ['users']
                });
                if (room) {
                    return await this.roomRepository.remove(room);
                }
            }
        }
    }
    async leaveOwner(current_user_id, room_id, new_owner_id) {
        const user = await this.userService.get_current_rooms(current_user_id);
        const newOwner = await this.userService.get_current_rooms(new_owner_id);
        if (user && newOwner) {
            const room = await this.getRoomInfo(room_id);
            if (room) {
                if (room.owner.user_id == current_user_id) {
                    room.owner = newOwner;
                    const res = await this.roomRepository.save(room);
                    if (res) {
                        const newOwnerRef = await this.roomsUsersRefRepository.findOne({
                            where: [{ room: { room_id: room.room_id }, user: { user_id: newOwner.user_id } }],
                            relations: ['user']
                        });
                        if (newOwnerRef) {
                            newOwnerRef.role = 'owner';
                            const res = await this.roomsUsersRefRepository.save(newOwnerRef);
                            if (res) {
                                if (this.leaveRoom(current_user_id, room_id, false) != null) {
                                    return res;
                                }
                            }
                        }
                    }
                }
            }
        }
        throw new Error('Error : Action cannot be performed');
    }
    async muteUserFromRoom(current_user_id, room_id, muted_user_id, mute_time_second) {
        const user = await this.userService.get_current_rooms(current_user_id);
        const mutedUser = await this.userService.get_current_rooms(muted_user_id);
        if (user && mutedUser) {
            const room = await this.getRoomInfo(room_id);
            if (room) {
                if (room.users && room.users.find(r => r.user_id == current_user_id) && room.users.find(r => r.user_id == muted_user_id)) {
                    const CurrentuserRef = await this.roomsUsersRefRepository.findOne({
                        where: [{ room: { room_id: room.room_id }, user: { user_id: user.user_id } }],
                        relations: ['user']
                    });
                    if (CurrentuserRef.status == 'active' && CurrentuserRef.role != 'member') {
                        const mutedUserRef = await this.roomsUsersRefRepository.findOne({
                            where: [{ room: { room_id: room.room_id }, user: { user_id: mutedUser.user_id } }],
                            relations: ['user']
                        });
                        if (mutedUserRef && mutedUserRef.status == 'active' && mutedUserRef.role != 'owner') {
                            const mute = new mute_entity_1.Mute();
                            mute.mute_user_id = mutedUser.user_id;
                            mute.mutedUser = mutedUserRef;
                            mute.mute_room_id = room.room_id;
                            mute.mute_time = mute_time_second;
                            const res = await this.muteRepository.save(mute);
                            if (res) {
                                mutedUserRef.status = 'muted';
                                return await this.roomsUsersRefRepository.save(mutedUserRef);
                            }
                        }
                    }
                }
            }
        }
        throw new Error('Resource not found');
    }
    async UnmuteUserFromRoom(current_user_id, room_id, muted_user_id) {
        const user = await this.userService.get_current_rooms(current_user_id);
        const mutedUser = await this.userService.get_current_rooms(muted_user_id);
        if (mutedUser && user) {
            const room = await this.getRoomInfo(room_id);
            if (room && room.users && room.users.find(r => r.user_id == current_user_id) && room.users.find(r => r.user_id == muted_user_id)) {
                const CurrentuserRef = await this.roomsUsersRefRepository.findOne({
                    where: [{ room: { room_id: room.room_id }, user: { user_id: user.user_id } }],
                    relations: ['user']
                });
                if ((CurrentuserRef.status == 'active' && CurrentuserRef.role != 'member') || CurrentuserRef.user.user_id == mutedUser.user_id) {
                    const mutedUserRef = await this.roomsUsersRefRepository.findOne({
                        where: [{ room: { room_id: room.room_id }, user: { user_id: mutedUser.user_id } }],
                        relations: ['user']
                    });
                    if (mutedUserRef && mutedUserRef.status == 'muted') {
                        const mute = await this.muteRepository.findOne({
                            where: [{ mute_user_id: mutedUser.user_id, mute_room_id: room.room_id }],
                            relations: ['mutedUser']
                        });
                        if (mute) {
                            await this.muteRepository.remove(mute);
                            mutedUserRef.status = 'active';
                            return await this.roomsUsersRefRepository.save(mutedUserRef);
                        }
                    }
                }
            }
        }
    }
};
exports.RoomsChatService = RoomsChatService;
exports.RoomsChatService = RoomsChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(room_entity_1.Room)),
    __param(1, (0, typeorm_1.InjectRepository)(rooms_users_ref_entity_1.RoomsUsersRef)),
    __param(2, (0, typeorm_1.InjectRepository)(room_message_entity_1.RoomMessage)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => chat_gateway_service_1.ChatGatewayService))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => friendreq_service_1.FriendReqService))),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __param(6, (0, common_1.Inject)((0, common_1.forwardRef)(() => profile_service_1.ProfileService))),
    __param(7, (0, common_1.Inject)((0, common_1.forwardRef)(() => notif_service_1.NotifService))),
    __param(8, (0, typeorm_1.InjectRepository)(mute_entity_1.Mute)),
    __metadata("design:paramtypes", [roomschat_repository_1.RoomsChatRepository,
        roomschat_repository_1.RoomsUsersRefRepository,
        roomschat_repository_1.RoomMessageRepository,
        chat_gateway_service_1.ChatGatewayService,
        friendreq_service_1.FriendReqService,
        users_service_1.UsersService,
        profile_service_1.ProfileService,
        notif_service_1.NotifService,
        roomschat_repository_1.MuteRepository])
], RoomsChatService);
//# sourceMappingURL=roomschat.service.js.map