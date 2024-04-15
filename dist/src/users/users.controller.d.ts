import { Friendship } from './entities/friendship.entity';
import { InfoDto, SendFriendRequestDto, UserDto, UserUpdatedDto, userInfo } from 'src/utils/dto';
import { UsersService } from './services/users.service';
import { FriendReqService } from './services/friendreq.service';
import { ProfileService } from './services/profile.service';
import { BlockService } from './services/block.service';
export declare class UsersController {
    private readonly usersService;
    private readonly friendReqService;
    private readonly profileService;
    private readonly blockService;
    constructor(usersService: UsersService, friendReqService: FriendReqService, profileService: ProfileService, blockService: BlockService);
    get_statistics(Currentuser: any, user_id: number): Promise<import("./services/users.service").UserStatistic>;
    get_achievements(Currentuser: any): Promise<string>;
    get_level_info(Currentuser: any, user_id: number): Promise<import("./services/users.service").LevelInfo>;
    test(Currentuser: any, user_id: number): Promise<import("../game/game.service").Match[]>;
    isloggedin(Currentuser: any): void;
    get_all_users(Currentuser: any): Promise<UserDto[]>;
    get_leaderboard(): Promise<import("./services/users.service").userDatashboad[]>;
    get_user_profile(Currentuser: any): Promise<UserDto>;
    get_user_by_email(Email: string): Promise<{
        user: import("./entities").User;
        profile: import("./entities").Profile;
    }>;
    get_user_by_id(Currentuser: any, user_id: number): Promise<UserDto>;
    update_user(Currentuser: userInfo, UserUpdatedInfo: UserUpdatedDto): Promise<import("./entities").User>;
    getFriends(Currentuser: any): Promise<UserDto[]>;
    getPendingFriendRequests(Currentuser: userInfo): Promise<UserDto[]>;
    getBlockedFriends(Currentuser: userInfo): Promise<UserDto[]>;
    sendFriendRequest(Currentuser: userInfo, FriendRequest: SendFriendRequestDto): Promise<Friendship>;
    acceptFriendRequest(Currentuser: userInfo, FriendRequest: InfoDto): Promise<Friendship>;
    rejectFriendRequest(Currentuser: userInfo, FriendRequest: InfoDto): Promise<Friendship>;
    deleteFriend(Currentuser: userInfo, friendId: number): Promise<Friendship>;
    unblockFriend(Currentuser: userInfo, FriendRequest: InfoDto): Promise<Friendship>;
    blockFriend(Currentuser: userInfo, FriendRequest: InfoDto): Promise<Friendship>;
}
