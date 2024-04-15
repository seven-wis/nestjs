import { ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { User, Friendship, Profile } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendShipRepository, ProfileRepository, UsersRepository } from 'src/utils/repositories';
import { AuthUserTdo, FriendshipStatus, UserDto, UserStatus, UserUpdatedDto } from 'src/utils/dto';
import { FriendReqService } from './friendreq.service';
import { BlockService } from './block.service';
import { privateDecrypt } from 'crypto';
import { UsersService } from './users.service';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(User) private readonly UsersRepo: UsersRepository,
        @InjectRepository(Friendship) private readonly FriendsRepo: FriendShipRepository,
        @InjectRepository(Profile) private readonly ProfileRepo: ProfileRepository,
        // private readonly friendReqService: FriendReqService,
        @Inject(forwardRef(() => FriendReqService)) private readonly friendReqService: FriendReqService,


        @Inject(forwardRef(() => BlockService)) private readonly blockService: BlockService,
        @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
        
        // private readonly blockService: BlockService,
        // private readonly usersService: UsersService,
    ) { }

    /* ################################### get all users from the database ######################################## */

    async get_friendship_by_id(sender: number, receiver: number): Promise<Friendship> | null {
        return await this.FriendsRepo.findOne({
            where: [
                { sender: { user_id: sender }, receiver: { user_id: receiver } },
                { sender: { user_id: receiver }, receiver: { user_id: sender } }
            ],
            relations: ['sender', 'receiver']
        });
    }

    async get_all_users(currentUser_id: number): Promise<UserDto[]> {
        const allUsers = await this.UsersRepo.find({ relations: ['profile'] });

        const allUsersRes: UserDto[] = [];
        for (let i = 0; i < allUsers.length; i++) {
            const friendship: Friendship = await this.get_friendship_by_id(currentUser_id, allUsers[i].user_id);
            if (friendship && friendship.status === 'blocked') {
                continue;
            }
            allUsersRes.push({
                id: allUsers[i].user_id,
                name: allUsers[i].user_name,
                currentAvatar: allUsers[i].profile.user_avatar,
            });
        }
        return allUsersRes;
    }

    /* ############################################################################################################ */

    /* ################################### get user profile from the database ######################################## */

    async get_user_profile(current_user_id: number): Promise<UserDto> {
        const user = await this.UsersRepo.findOne({
            where: { user_id: current_user_id },
            relations: ['profile']
        });

        const friends: UserDto[] = await this.getAllFriends(current_user_id);
        const FriendReq: UserDto[] = await this.friendReqService.getPendingFriendRequests(current_user_id);
        const blocked: UserDto[] = await this.blockService.getblockedfriends(current_user_id);

        const FrontUser: UserDto = {
            id: user.user_id,
            name: user.user_name,
            email: user.profile.user_email,
            status: user.profile.user_Status,
            firsName: user.profile.user_firstName,
            lastName: user.profile.user_lastName,
            currentAvatar: user.profile.user_avatar,
            wins: user.profile.wins,
            loses: user.profile.loses,
            score: user.profile.score,
            firstlogin: user.profile.firstlogin,
            twoFactAuth: user.profile.twoFactAuth,
            BotLevel: user.profile.BotLevel,
            friends: friends,
            friendRequest: FriendReq,
            blocked: blocked
        }

        return FrontUser;
    }

    // async user_data(user_id: number) {
    //     return await this.UsersRepo.findOne({
    //         where: { user_id: user_id },
    //         relations: ['profile']
    //     });
    // }

    async get_user_by_id(current_user_id: number, user_id: number) {
        const friendship: Friendship = await this.get_friendship_by_id(current_user_id, user_id);
        if ((friendship && friendship.status === 'blocked') || user_id == current_user_id) {
            throw new ForbiddenException('Resource not found');
        }

        const friendFilter = async function (UserInfoFriends: UserDto[]): Promise<UserDto[]> {
            for (let i = 0; i < UserInfoFriends.length; i++) {
                const friendship: Friendship = await this.get_friendship_by_id(current_user_id, UserInfoFriends[i].id);
                if (friendship && friendship.status === 'blocked') {
                    UserInfoFriends.splice(i, 1);
                    i--;
                }
            }
            return UserInfoFriends;
        }

        const UserInfo: UserDto = await this.get_user_profile(user_id);

        UserInfo.friends = await friendFilter.call(this, UserInfo.friends);

        let friend_status: FriendshipStatus;

        if (friendship) {
            if (friendship.status === 'accepted') {
                friend_status = FriendshipStatus.Isfriend;
            } else if (friendship.status === 'pending') {
                if (friendship.sender.user_id === current_user_id) {
                    friend_status = FriendshipStatus.RequestSend;
                } else {
                    friend_status = FriendshipStatus.RequestRecived;
                }
            }
        } else {
            friend_status = FriendshipStatus.non;
        }

        const UserInfoRes: UserDto = {
            id: UserInfo.id,
            name: UserInfo.name,
            status: (friendship && friendship.status === "accepted") ? UserInfo.status : UserStatus.Walo,
            FriendshipStatus: friend_status,
            firsName: UserInfo.firsName,
            lastName: UserInfo.lastName,
            currentAvatar: UserInfo.currentAvatar,
            wins: UserInfo.wins,
            loses: UserInfo.loses,
            score: UserInfo.score,
            friends: UserInfo.friends,
            friendShipToken: friendship ? friendship.friendshiptoekn : null
        }

        return UserInfoRes;
    }

    async getAllFriends(userId: number): Promise<UserDto[]> {
        const friendships = await this.FriendsRepo.find({
            where: [
                { sender: { user_id: userId }, status: 'accepted' },
                { receiver: { user_id: userId }, status: 'accepted' },
            ],
            relations: [
                'sender', 'receiver'
            ],
        });

        const FrontAllFriends /*: UserDto[]*/ = [];

        const friends = friendships.map((friendship) => { return friendship.sender.user_id == userId ? friendship.receiver : friendship.sender; });
        for (let i = 0; i < friends.length; i++) {
            friends[i] = await this.usersService.user_data(friends[i].user_id);
            FrontAllFriends.push({
                id: friends[i].user_id,
                name: friends[i].user_name,
                currentAvatar: friends[i].profile.user_avatar,
                status: friends[i].profile.user_Status,
                friendShipToken: friendships[i].friendshiptoekn,
                IsFriend: true,
            });
        }

        return FrontAllFriends;
    }

    async update_user(current_user_id: number, userdata: UserUpdatedDto) {
        const user = await this.UsersRepo.findOne({
            where: { user_id: current_user_id },
            relations: ['profile']
        });
        if (user) {
            const profile = await this.ProfileRepo.findOne({
                where: { id: user.profile.id }
            });
            user.user_name = userdata.user_username;

            profile.firstlogin = false;
            profile.user_firstName = userdata.user_firstName;
            profile.user_lastName = userdata.user_lastName;
            profile.user_avatar = `${userdata.user_avatar}`;

            await this.ProfileRepo.save(profile);
            return await this.UsersRepo.save(user);
        }
        throw new NotFoundException('User not found');
    }


    async update_user_account(user: User) {
        return await this.UsersRepo.save(user);
    }

    async add_two_factor_auth(current_user_id: number, secret?: string, twoFactAuth = false) {
        const user = await this.UsersRepo.findOne({
            where: { user_id: current_user_id },
            relations: ['profile']
        });
        if (user) {
            const profile = await this.ProfileRepo.findOne({
                where: { id: user.profile.id }
            });
            profile.twoFactAuth = twoFactAuth;
            profile.twoFactSecret = secret;
            await this.ProfileRepo.save(profile);
            return await this.UsersRepo.save(user);
        }
        throw new NotFoundException('User not found');
    }
}