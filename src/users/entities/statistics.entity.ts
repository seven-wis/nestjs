import { User } from "src/users/entities";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Statistics {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    date: string;

    @Column({ default: 0 })
    totalScore: number;

    @Column({ default: 0 })
    totalMatches: number;

    @Column({ default: 0 })
    totalWins: number;

    @Column({ default: 0 })
    totalLoses: number;

    @ManyToOne(() => User, user => user.Statistics, { cascade: true, onDelete: 'CASCADE' })
    Player: User;

    constructor() {
        this.date = new Date().toISOString();
        this.totalLoses = 0;
        this.totalMatches = 0;
        this.totalScore = 0;
        this.totalWins = 0;
    }
}