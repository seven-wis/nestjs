import { Friendship } from './friendship.entity';
import { Profile } from './profile.entity';
import { Room } from 'src/chat/entities/room.entity';
import { RoomsUsersRef } from 'src/chat/entities/rooms_users_ref.entity';
import { GameHistory } from 'src/game/entities/game.entity';
import { Statistics } from 'src/users/entities';
import { Achievements } from 'src/users/entities';
export declare class User {
    user_id: number;
    user_name: string;
    profile: Profile;
    sentFriendRequests: Friendship[];
    receivedFriendRequests: Friendship[];
    friends: Friendship[];
    blockedUsers: Friendship[];
    sentMessages: Friendship[];
    receivedMessages: Friendship[];
    rooms: Room[];
    owned_rooms: Room[];
    roomsUsersRef: RoomsUsersRef[];
    matches: GameHistory[];
    Statistics: Statistics[];
    achievements: Achievements[];
}
