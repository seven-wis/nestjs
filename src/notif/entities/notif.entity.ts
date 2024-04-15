import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Notifications {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    notif_user_id: number;

    @Column()
    notif_avatar: string;

    @Column({ type: 'enum', enum: ['friendReq', 'roomInvit', 'roomAction'] })
    notif_type: string;

    @Column()
    notif_title: string;

    @Column()
    notif_description: string;

    @Column()
    notif_status: string;

    @Column({ nullable: true })
    notif_target: string; // can be friendship_token or room_id

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
}
