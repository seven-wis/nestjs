import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Achievements {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    achievement_id: number;

    @Column()
    name: string;

    @Column()
    image: string;

    @Column()
    time: string;

    @Column({ default: false})
    seen: boolean;

    @Column({default: 12})
    count: number;

    @ManyToOne(() => User, user => user.achievements, { cascade: true, onDelete: 'CASCADE' })
    Player: User;
}