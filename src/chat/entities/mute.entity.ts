import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { RoomsUsersRef } from "./rooms_users_ref.entity";

@Entity()
export class Mute {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    mute_user_id: number;

    @Column()
    mute_room_id: number;

    @Column()
    mute_time: number;

    @OneToOne(() => RoomsUsersRef, roomsUsersRef => roomsUsersRef.mute, { cascade: true, onDelete: 'CASCADE'})
    mutedUser: RoomsUsersRef;
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;
}
