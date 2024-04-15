import { Repository } from 'typeorm';
import { Friendship } from 'src/users/entities';
export declare class FriendShipRepository extends Repository<Friendship> {
    GetFriendship(sender_id: number, receiver_id: number): Promise<Friendship>;
}
