import { ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { User, Friendship, Profile } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendShipRepository, ProfileRepository, UsersRepository } from 'src/utils/repositories';
import { AuthUserTdo, UserDto } from 'src/utils/dto';
import { ProfileService } from './profile.service';
import { UsersService } from './users.service';
import { ProfileGatewayService } from 'src/websockets/profile-gateway/profileGateway.service';

@Injectable()
export class BlockService {
    constructor(
        @InjectRepository(User) private readonly UsersRepo: UsersRepository,
        @InjectRepository(Friendship) private readonly FriendsRepo: FriendShipRepository,
        @InjectRepository(Profile) private readonly ProfileRepo: ProfileRepository,
        // private readonly usersService: UsersService,
        @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
        @Inject(forwardRef(() => ProfileService)) private readonly profileService: ProfileService,
        @Inject(forwardRef(() => ProfileGatewayService)) private readonly profileGatewayService: ProfileGatewayService,
    ) { }

    async blockfriend(currentUserId: number, friendId: number) {
        const currentUser = await this.UsersRepo.findOne({ where: { user_id: currentUserId } });
        const friend = await this.UsersRepo.findOne({ where: { user_id: friendId } });

        if (currentUser && friend) {
            const friendshipToBlock = await this.FriendsRepo.findOne({
                where: [
                    { sender: { user_id: currentUser.user_id }, receiver: { user_id: friend.user_id } },
                    { sender: { user_id: friend.user_id }, receiver: { user_id: currentUser.user_id } },
                ],
                relations: ['sender', 'receiver'],
            });

            if (friendshipToBlock && friendshipToBlock.status === 'accepted') {
                friendshipToBlock.status = 'blocked';
                friendshipToBlock.blockedBy = currentUser;
                const res = await this.FriendsRepo.save(friendshipToBlock);
                if (res) {
                    this.profileGatewayService.friend_Ship_event(currentUser.user_id, friend.user_id);
                    return res;
                }
            }
            throw new ForbiddenException('Friendship not found');
        }
        throw new NotFoundException('Friendship not found');
    }

    async unblockfriend(currentUserId: number, friendId: number) {
        const currentUser = await this.UsersRepo.findOne({ where: { user_id: currentUserId } });
        const friend = await this.UsersRepo.findOne({ where: { user_id: friendId } });

        if (currentUser && friend) {
            const friendshipToBlock = await this.FriendsRepo.findOne({
                where: [
                    { sender: { user_id: currentUser.user_id }, receiver: { user_id: friend.user_id } },
                    { sender: { user_id: friend.user_id }, receiver: { user_id: currentUser.user_id } },
                ],
                relations: ['blockedBy', 'sender', 'receiver'],
            });


            if (friendshipToBlock && friendshipToBlock.status === 'blocked' && friendshipToBlock.blockedBy && friendshipToBlock.blockedBy.user_id == currentUser.user_id) {
                return await this.FriendsRepo.remove(friendshipToBlock);
            }
        }
        throw new NotFoundException('Friendship not found');
    }

    async getblockedfriends(currentUserId: number) {
        const currentUser = await this.UsersRepo.findOne({ where: { user_id: currentUserId } });

        if (currentUser) {
            const blockedFriends = await this.FriendsRepo.find({
                where: [
                    { sender: { user_id: currentUser.user_id }, status: 'blocked', blockedBy: { user_id: currentUser.user_id } },
                    { receiver: { user_id: currentUser.user_id }, status: 'blocked', blockedBy: { user_id: currentUser.user_id } },
                ],
                relations: ['blockedBy', 'receiver', 'sender'],
            });

            const FrontAllFriends: UserDto[] = [];
            const B_friends = blockedFriends.map((friendship) => {
                return friendship.sender.user_id == currentUserId ? friendship.receiver : friendship.sender;
            });

            for (let i = 0; i < B_friends.length; i++) {
                B_friends[i] = await this.usersService.user_data(B_friends[i].user_id);
                FrontAllFriends.push({
                    id: B_friends[i].user_id,
                    name: B_friends[i].user_name,
                    currentAvatar: B_friends[i].profile.user_avatar,
                    status: B_friends[i].profile.user_Status,
                });
            }
            return FrontAllFriends;
        }
        throw new NotFoundException('User not found');
    }
}