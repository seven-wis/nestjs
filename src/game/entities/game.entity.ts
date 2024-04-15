import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/users/entities";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { GameHistoryResult, GameObject } from "../dto/game.dto";



@Entity()
export class GameHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    MatchId: string;

    @Column()
    gameType: string;

    @ManyToMany(() => User, user => user.matches, {cascade: true, onDelete: 'CASCADE'})
    Player: User[];

    @Column({ nullable: true })
    Player1: number;

    @Column({ nullable: true })
    Player2: number;

    @Column("jsonb", { default: { Player1: { userId: 0, userScore: 0 }, Player2: { userId: 0, userScore: 0 } } })
    result: GameHistoryResult;

    @Column('jsonb', { nullable: true })
    matchRender: GameObject[];

    @Column({ nullable: true })
    Winner: number;

    @Column({ default: false })
    matchOver: boolean;
}
