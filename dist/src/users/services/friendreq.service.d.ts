import { Friendship } from '../entities';
import { FriendShipRepository, ProfileRepository, UsersRepository } from 'src/utils/repositories';
import { UserDto } from 'src/utils/dto';
import { UsersService } from './users.service';
import { NotifService } from 'src/notif/notif.service';
import { ProfileGatewayService } from 'src/websockets/profile-gateway/profileGateway.service';
export declare class FriendReqService {
    private readonly UsersRepo;
    private readonly FriendsRepo;
    private readonly ProfileRepo;
    private readonly usersService;
    private readonly notifService;
    private readonly profileGatewayService;
    constructor(UsersRepo: UsersRepository, FriendsRepo: FriendShipRepository, ProfileRepo: ProfileRepository, usersService: UsersService, notifService: NotifService, profileGatewayService: ProfileGatewayService);
    sendFriendRequest(senderId: number, receiverId: number): Promise<Friendship> | null | undefined;
    getPendingFriendRequests(currentUserId: number): Promise<UserDto[]>;
    do_event_by_token(curent_user_id: number, notif_id: number, friendship_token: string, event: string): Promise<{
        res: any;
        message: string;
    }>;
    acceptFriendRequest(currentUserId: number, friendId: number): Promise<Friendship>;
    rejectFriendRequest(currentUserId: number, friendId: number): Promise<Friendship>;
    deleteFriend(currentUserId: number, friendId: number): Promise<Friendship>;
    getFriendShip(Sender_id: number, Receiver_id: number): Promise<Friendship>;
}
