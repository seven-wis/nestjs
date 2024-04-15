import { PrimaryGeneratedColumn, Column, ManyToOne, Entity } from "typeorm";
import { Room } from "./room.entity";
import { User } from "src/users/entities";

@Entity()
export class RoomMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    timestamp: Date;

    @ManyToOne(() => User, user => user.sentMessages)
    sender: User;
    
    @ManyToOne(() => Room, room => room.messages, { cascade: true, onDelete: 'CASCADE'})
    room: Room;
}