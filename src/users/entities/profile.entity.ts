import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { PlayProgress } from './playerProgress.entity';

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    user_email: string;

    @Column()
    user_avatar: string;

    @Column()
    user_firstName: string;

    @Column()
    user_lastName: string;

    @Column()
    user_Status: number;

    @Column({ default: 0 })
    wins: number;

    @Column({ default: 0 })
    loses: number;

    @Column({ default: 0 })
    score: number;

    @Column({ default: 0 })
    Maxscore: number;

    @Column({ default: 0 })
    level: number;

    @Column({ default: 0 })
    nextLevelPercent: number;

    @Column({ default: true })
    firstlogin: boolean;

    @Column({ default: false })
    twoFactAuth: boolean;

    @Column({ nullable: true })
    twoFactSecret: string;

    @Column({ type: 'float', default: 0.25 })
    BotLevel: number;

    @OneToOne(() => User, (user) => user.profile)
    @JoinColumn()
    user: User;

    @OneToOne(() => PlayProgress, (Userprogress) => Userprogress.profile)
    @JoinColumn()
    Progress: PlayProgress;
}
