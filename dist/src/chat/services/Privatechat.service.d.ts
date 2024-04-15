import { ProfileService } from 'src/users/services/profile.service';
import { UserDto } from 'src/utils/dto';
import { FriendReqService } from '../../users/services/friendreq.service';
import { UsersService } from '../../users/services/users.service';
import { FriendShipRepository, PrivateChatRepository } from '../../utils/repositories';
export interface MessageDto {
    messageId: number;
    userId: number;
    userName: string;
    userAvatar?: string;
    time: string;
    message: string;
}
export declare class PrivateChatService {
    private readonly privateChatRepository;
    private readonly friendshipRepository;
    private readonly friendReqService;
    private readonly usersService;
    private readonly profileService;
    constructor(privateChatRepository: PrivateChatRepository, friendshipRepository: FriendShipRepository, friendReqService: FriendReqService, usersService: UsersService, profileService: ProfileService);
    timeFormat: (dateString: string) => string;
    createNewMessage(sender_id: number, receiver_id: number, message_content: string): Promise<{
        messageId: number;
        userId: number;
        userName: string;
        userAvatar: string;
        time: string;
        fullTime: string;
        message: string;
    }>;
    DeleteMessage(message_id: number): Promise<void>;
    getMessageCount(user_id: number, friend_id: number): Promise<number>;
    markAsRead(user_id: number, friend_id: number): Promise<import("typeorm").UpdateResult>;
    getMessages(user_id: number, friend_id: number): Promise<MessageDto[]>;
    getCurrentUserPm(current_user_id: number): Promise<UserDto[]>;
}
