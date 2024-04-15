import { User, Friendship } from '../entities';
import { FriendShipRepository, ProfileRepository, UsersRepository } from 'src/utils/repositories';
import { UserDto, UserUpdatedDto } from 'src/utils/dto';
import { FriendReqService } from './friendreq.service';
import { BlockService } from './block.service';
import { UsersService } from './users.service';
export declare class ProfileService {
    private readonly UsersRepo;
    private readonly FriendsRepo;
    private readonly ProfileRepo;
    private readonly friendReqService;
    private readonly blockService;
    private readonly usersService;
    constructor(UsersRepo: UsersRepository, FriendsRepo: FriendShipRepository, ProfileRepo: ProfileRepository, friendReqService: FriendReqService, blockService: BlockService, usersService: UsersService);
    get_friendship_by_id(sender: number, receiver: number): Promise<Friendship> | null;
    get_all_users(currentUser_id: number): Promise<UserDto[]>;
    get_user_profile(current_user_id: number): Promise<UserDto>;
    get_user_by_id(current_user_id: number, user_id: number): Promise<UserDto>;
    getAllFriends(userId: number): Promise<UserDto[]>;
    update_user(current_user_id: number, userdata: UserUpdatedDto): Promise<User>;
    update_user_account(user: User): Promise<User>;
    add_two_factor_auth(current_user_id: number, secret?: string, twoFactAuth?: boolean): Promise<User>;
}
