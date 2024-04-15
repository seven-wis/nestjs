import { ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { User, Friendship, Profile } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendShipRepository, ProfileRepository, UsersRepository } from 'src/utils/repositories';
import { AuthUserTdo, UserDto, UserStatus } from 'src/utils/dto';
import { UsersService } from './users.service';
import { v4 as uuidv4 } from 'uuid';
import { NotifService } from 'src/notif/notif.service';
import { ProfileGatewayService } from 'src/websockets/profile-gateway/profileGateway.service';

@Injectable()
export class FriendReqService {
    constructor(
        @InjectRepository(User) private readonly UsersRepo: UsersRepository,
        @InjectRepository(Friendship) private readonly FriendsRepo: FriendShipRepository,
        @InjectRepository(Profile) private readonly ProfileRepo: ProfileRepository,

        @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,

        // private readonly usersService: UsersService,
        
        private readonly notifService: NotifService,
        @Inject(forwardRef(() => ProfileGatewayService)) private readonly profileGatewayService: ProfileGatewayService,

    ) { }

    async sendFriendRequest(senderId: number, receiverId: number): Promise<Friendship> | null | undefined {
        const sender = await this.UsersRepo.findOne({
            where: {
                user_id: senderId
            },
            relations: ['profile']
        });

        const receiver = await this.UsersRepo.findOne({
            where: {
                user_id: receiverId
            },
            relations: ['profile']
        });

        if (sender && receiver && senderId !== receiverId) {
            const existingFriendship = await this.FriendsRepo.findOne({
                where: [
                    { sender: { user_id: sender.user_id }, receiver: { user_id: receiver.user_id } },
                    { sender: { user_id: receiver.user_id }, receiver: { user_id: sender.user_id } },
                ],
            });
            if (!existingFriendship) {
                const newFriendRequest = this.FriendsRepo.create({
                    friendshiptoekn: (sender.user_id.toString() + uuidv4() + receiver.user_id.toString()),
                    sender,
                    receiver,
                    friend: { user_id: receiver.user_id },
                    status: 'pending',
                });

                const res = await this.FriendsRepo.save(newFriendRequest);
                if (res) {
                    this.notifService.create_Notification(
                        senderId,
                        {
                            notif_user_id: receiver.user_id,
                            notif_avatar: sender.profile.user_avatar,
                            notif_description: `${sender.user_name} sent you a friend request`,
                            notif_title: 'Friend Request',
                            notif_type: 'friendReq',
                            notif_status: 'unread',
                            notif_target: newFriendRequest.friendshiptoekn
                        }
                    );
                    return res;
                }
            }
        }
        throw new ForbiddenException('Request rejected Because the user is already a friend or the user does not exist');
    }

    async getPendingFriendRequests(currentUserId: number): Promise<UserDto[]> {
        const currentUser = await this.UsersRepo.findOne({
            where: { user_id: currentUserId }
        });

        if (currentUser) {
            const pendingFriendRequests = await this.FriendsRepo.find({
                where: {
                    receiver: { user_id: currentUser.user_id },
                    status: 'pending',
                },
                relations: ['sender'],
            });

            const FriendReq: UserDto[] = [];

            for (let i = 0; i < pendingFriendRequests.length; i++) {

                const user = await this.usersService.user_data(pendingFriendRequests[i].sender.user_id);


                FriendReq.push({
                    id: user.user_id,
                    name: user.user_name,
                    currentAvatar: user.profile.user_avatar,
                    status: user.profile.user_Status,
                });
            }
            return FriendReq;
        }
        throw new NotFoundException('User not found');
    }

    async do_event_by_token(curent_user_id: number, notif_id: number, friendship_token: string, event: string) {
        const currentUser = await this.UsersRepo.findOne({
            where: { user_id: curent_user_id }
        });

        const friendship = await this.FriendsRepo.findOne({
            where: { friendshiptoekn: friendship_token },
            relations: ['sender', 'receiver']
        });

        if (currentUser && friendship && friendship.status === 'pending') {
            let res: any;
            let friend_id = (friendship.sender.user_id === currentUser.user_id) ? friendship.receiver.user_id : friendship.sender.user_id;

            if (event === 'Accept') {
                res = await this.acceptFriendRequest(currentUser.user_id, friend_id);

            } else if (event === 'Reject') {
                res = await this.rejectFriendRequest(currentUser.user_id, friend_id);
            }

            if (res) {
                this.profileGatewayService.friend_ship_event_emitter(event.toLocaleLowerCase(), currentUser.user_id, friend_id);
                return {
                    res,
                    message: `You have ${event.toLocaleLowerCase()}'ed the friend request`
                };
            }
            throw new ForbiddenException('Friendship not found');
        }
        throw new NotFoundException('Friendship not found');
    }


    async acceptFriendRequest(currentUserId: number, friendId: number) {
        const currentUser = await this.UsersRepo.findOne({ where: { user_id: currentUserId } });
        const friend = await this.UsersRepo.findOne({ where: { user_id: friendId } });

        if (currentUser && friend) {
            const friendshipToAccept = await this.FriendsRepo.findOne({
                where: [
                    { sender: { user_id: friend.user_id }, receiver: { user_id: currentUser.user_id } },
                    { sender: { user_id: currentUser.user_id }, receiver: { user_id: friend.user_id } },
                ],
                relations: ['sender', 'receiver'],
            });

            if (friendshipToAccept && friendshipToAccept.status === 'pending') {
                friendshipToAccept.status = 'accepted';
                const res = await this.FriendsRepo.save(friendshipToAccept);
                const notif = await this.notifService.get_NotificationByNotif_target(friendshipToAccept.friendshiptoekn);
                if (notif) {
                    this.profileGatewayService.friend_Ship_event(currentUser.user_id, friend.user_id);

                    await this.notifService.update_NotificationById(currentUserId, notif.id, 'read');
                }
                return res;
            } else {
                throw new NotFoundException('Friendship not found');
            }
        }
        throw new NotFoundException('Friendship not found');
    }

    async rejectFriendRequest(currentUserId: number, friendId: number) {
        const currentUser = await this.UsersRepo.findOne({ where: { user_id: currentUserId } });
        const friend = await this.UsersRepo.findOne({ where: { user_id: friendId } });

        if (currentUser && friend) {
            const friendshipToReject = await this.FriendsRepo.findOne({
                where: [
                    { sender: { user_id: friend.user_id }, receiver: { user_id: currentUser.user_id } },
                    { sender: { user_id: currentUser.user_id }, receiver: { user_id: friend.user_id } },
                ],
                relations: ['sender', 'receiver'],
            });

            if (friendshipToReject && friendshipToReject.status === 'pending') {
                const res = await this.FriendsRepo.remove(friendshipToReject);

                if (res) {

                    const notif = await this.notifService.get_NotificationByNotif_target(friendshipToReject.friendshiptoekn);
                    if (notif) {
                        this.profileGatewayService.friend_Ship_event(currentUser.user_id, friend.user_id);

                        await this.notifService.delete_NotificationById(currentUserId, notif.id);
                    }
                    return res;
                }
            }
        }
        throw new NotFoundException('Friendship not found');
    }

    async deleteFriend(currentUserId: number, friendId: number) {
        const currentUser = await this.UsersRepo.findOne({ where: { user_id: currentUserId } });
        const friend = await this.UsersRepo.findOne({ where: { user_id: friendId } });

        if (currentUser && friend) {
            const friendshipToRemove = await this.FriendsRepo.findOne({
                where: [
                    { sender: { user_id: currentUser.user_id }, receiver: { user_id: friend.user_id } },
                    { sender: { user_id: friend.user_id }, receiver: { user_id: currentUser.user_id } },
                ],
                relations: ['sender', 'receiver'],
            });

            if (friendshipToRemove) {
                this.profileGatewayService.friend_Ship_event(currentUser.user_id, friend.user_id);
                const res = await this.FriendsRepo.remove(friendshipToRemove);
                if (res) {
                    return res;
                }
            }
        }
        throw new NotFoundException('Friendship not found');
    }

    async getFriendShip(Sender_id: number, Receiver_id: number) {
        const Sender = await this.UsersRepo.findOne({ where: { user_id: Sender_id } });
        const Receiver = await this.UsersRepo.findOne({ where: { user_id: Receiver_id } });

        return await this.FriendsRepo.findOne({
            where: [
                { sender: { user_id: Sender.user_id }, receiver: { user_id: Receiver.user_id } },
                { sender: { user_id: Receiver.user_id }, receiver: { user_id: Sender.user_id } },
            ],
            relations: ['sender', 'receiver', 'blockedBy'],
        });
    }
}