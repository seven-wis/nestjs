import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { User, Friendship } from 'src/users/entities';

@Entity()
export class PrivateChat {
    @PrimaryGeneratedColumn()
    message_id: number;

    @ManyToOne(() => User, user => user.sentMessages)
    sender: User;

    @ManyToOne(() => User, user => user.receivedMessages)
    receiver: User;

    @ManyToOne(() => Friendship, friendship => friendship.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'friendshipId' })
    friendship: Friendship;
    
    @Column()
    content: string;

    @Column()
    timestamp: Date;

    @Column({ default: false })
    isRead: boolean;
}
