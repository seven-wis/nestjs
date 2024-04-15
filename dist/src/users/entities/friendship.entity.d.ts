import { User } from './user.entity';
import { PrivateChat } from '../../chat/entities/privatechat.entity';
export declare class Friendship {
    id: number;
    friendshiptoekn: string;
    sender: User;
    receiver: User;
    friend: User;
    status: string;
    blockedBy: User;
    messages: PrivateChat[];
}
