import { User } from "src/users/entities";
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne, JoinTable, OneToOne, JoinColumn } from "typeorm";
import { Room } from "./room.entity";
import { Mute } from "./mute.entity";
// import { Mute } from "./mute.entity";

@Entity()
export class RoomsUsersRef {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: ['owner', 'admin', 'member'], default: 'member' })
    role: string;

    @Column({ type: 'enum', enum: ['active', 'invited', 'banned', 'muted'], default: 'active' })
    status: string;

    @Column()
    ref_token: string;

    @ManyToOne(() => User, user => user.roomsUsersRef)
    user: User;

    @ManyToOne(() => Room, room => room.roomsUsersRef, { cascade: true, onDelete: 'CASCADE'})
    room: Room;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    // set to null if user is not muted
    @OneToOne(() => Mute, mute => mute.mutedUser, { onDelete: 'SET NULL'})
    @JoinColumn()
    mute: Mute;

    @Column({ default: 0 })
    number_of_unread_messages: number;
}