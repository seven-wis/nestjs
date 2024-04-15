import { User } from "src/users/entities";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RoomsUsersRef } from "./rooms_users_ref.entity";
import { RoomMessage } from "./room_message.entity";

@Entity()
export class Room {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    room_id: number;

    @Column()
    room_name: string;

    @Column({ type: 'enum', enum: ['public', 'private', 'protected'], default: 'public' })
    room_type: string;

    @Column({ nullable: true })
    room_password: string;

    @ManyToOne(() => User, user => user.owned_rooms)
    owner: User;

    @ManyToMany(() => User, user => user.rooms, { onDelete: 'CASCADE' })
    users: User[];

    @OneToMany(() => RoomsUsersRef, roomsUsersRef => roomsUsersRef.room)
    roomsUsersRef: RoomsUsersRef[];

    @OneToMany(() => RoomMessage, roomMessage => roomMessage.room)
    messages: RoomMessage[];
}