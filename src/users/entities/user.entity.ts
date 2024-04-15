import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn, ManyToMany, JoinTable, Table } from 'typeorm';
import { Friendship } from './friendship.entity';
import { Profile } from './profile.entity';
import { Room } from 'src/chat/entities/room.entity';
import { RoomsUsersRef } from 'src/chat/entities/rooms_users_ref.entity';
import { GameHistory } from 'src/game/entities/game.entity';
import { Statistics } from 'src/users/entities';
import { Achievements } from 'src/users/entities';

@Entity()
export class User {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    user_id: number;

    @Column({ unique: true })
    user_name: string;

    @OneToOne(() => Profile, (profile) => profile.user)
    @JoinColumn()
    profile: Profile;

    // l3echra managmenet
    @OneToMany(() => Friendship, (friendship) => friendship.sender)
    sentFriendRequests: Friendship[];

    @OneToMany(() => Friendship, (friendship) => friendship.receiver)
    receivedFriendRequests: Friendship[];

    @OneToMany(() => Friendship, (friendship) => friendship.friend)
    friends: Friendship[];

    @OneToMany(() => Friendship, (friendship) => friendship.blockedBy)
    blockedUsers: Friendship[];

    // messages management
    @OneToMany(() => Friendship, (friendship) => friendship.sender)
    sentMessages: Friendship[];

    @OneToMany(() => Friendship, (friendship) => friendship.receiver)
    receivedMessages: Friendship[];

    @ManyToMany(() => Room, room => room.users)
    @JoinTable()
    rooms: Room[];

    @OneToMany(() => Room, room => room.owner)
    owned_rooms: Room[];

    @OneToMany(() => RoomsUsersRef, roomsUsersRef => roomsUsersRef.user)
    roomsUsersRef: RoomsUsersRef[];

    // match history
    @ManyToMany(() => GameHistory, match => match.Player)
    @JoinTable()
    matches: GameHistory[];

    // statistics
    @OneToMany(() => Statistics, Statistics => Statistics.Player)
    Statistics: Statistics[];

    @OneToMany(() => Achievements, achievement => achievement.Player)
    achievements: Achievements[];
}
