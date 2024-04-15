import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from 'bcrypt';
import { User } from "src/users/entities";
import { ProfileService } from "src/users/services/profile.service";
import { UsersService } from "src/users/services/users.service";
import { MuteRepository, RoomMessageRepository, RoomsChatRepository, RoomsUsersRefRepository } from "src/utils/repositories/roomschat.repository";
import { v4 as uuidv4 } from 'uuid';
import { Room } from "../entities/room.entity";
import { RoomMessage } from "../entities/room_message.entity";
import { RoomsUsersRef } from "../entities/rooms_users_ref.entity";
import { RoomDto, RoomInfo } from "src/utils/dto";
import { ChatGatewayService } from "src/websockets/chat-gateway/chat-gateway.service";
import { FriendReqService } from "src/users/services/friendreq.service";
import { NotifService } from "src/notif/notif.service";
import { Mute } from "../entities/mute.entity";

@Injectable()
export class RoomsChatService {
    constructor(
        @InjectRepository(Room) private readonly roomRepository: RoomsChatRepository,
        @InjectRepository(RoomsUsersRef) private readonly roomsUsersRefRepository: RoomsUsersRefRepository,
        @InjectRepository(RoomMessage) private readonly roomMessageRepository: RoomMessageRepository,
        @Inject(forwardRef(() => ChatGatewayService)) private readonly chatGatewayService: ChatGatewayService,
        @Inject(forwardRef(() => FriendReqService)) private readonly friendReqService: FriendReqService,
        // private readonly friendReqService: FriendReqService,

        // private readonly profileService: ProfileService,
        // private readonly userService: UsersService,

        @Inject(forwardRef(() => UsersService)) private readonly userService: UsersService,
        @Inject(forwardRef(() => ProfileService)) private readonly profileService: ProfileService,


        // private readonly notifService: NotifService,
        @Inject(forwardRef(() => NotifService)) private readonly notifService: NotifService,
        @InjectRepository(Mute) private readonly muteRepository: MuteRepository,

    ) { }

    async createRoom(roomInfo: RoomInfo) {
        const user = await this.userService.get_current_rooms(roomInfo.current_user_id);
        if (user) {
            const room = new Room();
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
                }
            }
            throw new Error('Resource not found');
        }
    }

    async getRooms(current_user_id: number) {
        const currentUser = await this.userService.get_current_rooms(current_user_id);

        const rooms = await this.roomRepository.find({
            relations: ['owner', 'owner.profile', 'users', 'messages'],
            order: {
                messages: {
                    id: 'DESC'
                }
            }
        });

        let RoomsInfo: RoomDto[] = [];

        for (const room of rooms) {
            let InRoom: boolean = false;
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
        return RoomsInfo
    }

    async getRoomInfo(room_id: number): Promise<Room> {
        return await this.roomRepository.findOne({
            where: [{ room_id: room_id }],
            relations: ['users', 'users.profile', 'owner']
        });
    }

    async AddUserToRoom(room_id: number, curent_user_id: number, new_user_id: number, roll: string, event: string = 'add') {
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
                    const roomUsersRef = new RoomsUsersRef();
                    roomUsersRef.mute = null;
                    roomUsersRef.room = room;
                    roomUsersRef.user = NewUser;
                    roomUsersRef.status = 'active';
                    roomUsersRef.role = roll;
                    roomUsersRef.ref_token = uuidv4();

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
            } else if (newUserRef && event == 'invite') {
                newUserRef.status = 'invited';
                return await this.roomsUsersRefRepository.save(newUserRef);
            }
        }
        return null;
    }

    async do_event_by_token(current_user_id: number, notif_id: number, userRef_token: string, event: string) {
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
                        }
                    }
                }
            } else if (userRef.status == 'invited' && event == 'Reject') {
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
                        }
                    }
                }
            }
        }
        throw new Error('Resource not found');
    }

    async acceptInviteToRoom(current_user_id: number, room_id: number) {
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

    async inviteFriendToRoom(current_user_id: number, room_id: number, invited_user_id: number) {
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
                    })
                    if (!invitedUserRef) {
                        const res = await this.AddUserToRoom(room.room_id, CurrentUser.user_id, invitedUser.user_id, 'member', 'invite');
                        if (res) {
                            this.notifService.create_Notification(
                                current_user_id,
                                {
                                    notif_user_id: invitedUser.user_id,
                                    notif_avatar: CurrentUser.profile.user_avatar,
                                    notif_description: `${CurrentUser.user_name} invited you to ${room.room_name}`,
                                    notif_title: 'Room Invitation',
                                    notif_type: 'roomInvit',
                                    notif_status: 'unread',
                                    notif_target: res.ref_token
                                }
                            );
                            return res
                        }
                    }
                }
            }
        }

        throw new Error('Action cannot be performed');
    }

    async JoinRoom(current_user_id: number, room_id: number, password: string = null, roll: string) {
        const user = await this.userService.get_current_rooms(current_user_id);
        const room = await this.getRoomInfo(room_id);
        if (user && room) {
            if (room.users && room.users.find(r => r.user_id == current_user_id)) {
                throw new Error('User already in the room');
            }

            if ('protected' === room.room_type) {
                try {
                    const passwordMatched: boolean = await bcrypt.compare(password, room.room_password);
                    if (passwordMatched) {
                        return await this.AddUserToRoom(room.room_id, current_user_id, user.user_id, roll, 'add');
                    }
                } catch (e: any) {
                    throw new Error('Invalid Password');
                }

                throw new Error('Invalid Password');
            } else {
                const res = await this.AddUserToRoom(room.room_id, current_user_id, user.user_id, roll, 'add');
                const socketId = await this.chatGatewayService.GetUserSocket(user.user_id);
                if (socketId) {
                    this.chatGatewayService.EmitMessage(socketId.id, 'newMemberRoom', {});
                }
            }
        }
    }

    async checkMuteStatus(userRef: RoomsUsersRef) {
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
            } else {
                return Math.floor(mute.mute_time - ((CurrentTime.getTime() / 1000) - (mute.created_at.getTime() / 1000)));
            }
        }
    }

    async getRoomMembers(room_id: number, user_id: number) {
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

    async createRoomMessage(room_id: number, user_id: number, message: string) {
        const user = await this.userService.get_current_rooms(user_id);
        if (user) {
            const room = await this.getRoomInfo(room_id);
            if (room) {
                const userRef = await this.roomsUsersRefRepository.findOne({
                    where: [{ room: { room_id: room.room_id }, user: { user_id: user.user_id } }],
                    relations: ['user']
                });


                if (room && userRef && userRef.status === 'active') {
                    const roomMessage = new RoomMessage();
                    roomMessage.message = message;
                    roomMessage.room = room;
                    roomMessage.sender = user;

                    const Message = await this.roomMessageRepository.save(roomMessage);

                    return {
                        messageId: Message.id,
                        userId: Message.sender.user_id as number,
                        userName: Message.sender.user_name,
                        userAvatar: Message.sender.profile.user_avatar,
                        time: "",
                        fullTime: Message.timestamp.toISOString(),
                        message: Message.message
                    }
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

    async getRoomMessages(room_id: number, user_id: number) {
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
                            userId: message.sender.user_id as number,
                            userName: (Friendship && Friendship.status == 'blocked') ? "User" : message.sender.user_name,
                            userAvatar: (Friendship && Friendship.status == 'blocked') ? "https://www.shareicon.net/data/2017/05/30/886556_user_512x512.png" : message.sender.profile.user_avatar,
                            time: message.timestamp.toISOString().split('T')[1].split('.')[0].split(':').slice(0, 2).join(':'),
                            fullTime: message.timestamp.toISOString(),
                            message: message.message
                        });
                    }
                    return messages
                }
            }
            throw new Error('Resource not found');
        }
        throw new Error('Resource not found');
    }

    async banUserFromRoom(current_user_id: number, room_id: number, banned_user_id: number) {
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

    async UnbanUserFromRoom(current_user_id: number, room_id: number, banned_user_id: number) {
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

    async kickUserFromRoom(current_user_id: number, room_id: number, kicked_user_id: number) {
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

    async leaveRoom(current_user_id: number, room_id: number, owner_check: boolean = true) {
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

    async SetAdminSatatus(current_user_id: number, room_id: number, admin_user_to_set_id: number, MemberStatus: string) {
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

    async updateRoomInfo(roomInfo: RoomInfo /*current_user_id: number, roomId: number, roomName: string, roomType: string, roomPassword: string*/) {
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

    async deleteRoom(current_user_id: number, roomId: number) {
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

    async leaveOwner(current_user_id: number, room_id: number, new_owner_id: number) {
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

    async muteUserFromRoom(current_user_id: number, room_id: number, muted_user_id: number, mute_time_second: number) {
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
                            const mute = new Mute();
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

    async UnmuteUserFromRoom(current_user_id: number, room_id: number, muted_user_id: number) {
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
}