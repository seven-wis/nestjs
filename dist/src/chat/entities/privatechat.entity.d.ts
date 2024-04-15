import { User, Friendship } from 'src/users/entities';
export declare class PrivateChat {
    message_id: number;
    sender: User;
    receiver: User;
    friendship: Friendship;
    content: string;
    timestamp: Date;
    isRead: boolean;
}
