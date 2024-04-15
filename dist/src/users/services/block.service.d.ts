import { Friendship } from '../entities';
import { FriendShipRepository, ProfileRepository, UsersRepository } from 'src/utils/repositories';
import { UserDto } from 'src/utils/dto';
import { ProfileService } from './profile.service';
import { UsersService } from './users.service';
import { ProfileGatewayService } from 'src/websockets/profile-gateway/profileGateway.service';
export declare class BlockService {
    private readonly UsersRepo;
    private readonly FriendsRepo;
    private readonly ProfileRepo;
    private readonly usersService;
    private readonly profileService;
    private readonly profileGatewayService;
    constructor(UsersRepo: UsersRepository, FriendsRepo: FriendShipRepository, ProfileRepo: ProfileRepository, usersService: UsersService, profileService: ProfileService, profileGatewayService: ProfileGatewayService);
    blockfriend(currentUserId: number, friendId: number): Promise<Friendship>;
    unblockfriend(currentUserId: number, friendId: number): Promise<Friendship>;
    getblockedfriends(currentUserId: number): Promise<UserDto[]>;
}
