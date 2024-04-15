import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { PrivateChat } from '../../chat/entities/privatechat.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Friendship {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: uuidv4()})
    friendshiptoekn: string;
    
    @ManyToOne(() => User, (user) => user.sentFriendRequests)
    @JoinColumn({ name: 'senderId' })
    sender: User;

    @ManyToOne(() => User, (user) => user.receivedFriendRequests)
    @JoinColumn({ name: 'receiverId' })
    receiver: User;

    @ManyToOne(() => User, (user) => user.friends)
    @JoinColumn({ name: 'friendId' })
    friend: User;

    @Column({ default: 'pending' })
    status: string;

    @ManyToOne(() => User, (user) => user.blockedUsers)
    @JoinColumn({ name: 'blockedById' })
    blockedBy: User;

    @OneToMany(() => PrivateChat, chat => chat.friendship, { cascade: true, onDelete: 'CASCADE' })
    messages: PrivateChat[];
}
