import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GameBetting {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    gameId: number;

    @Column()
    bettingValue: number;

    @Column()
    betOn: number; // represent userId id

    @Column()
    status: string;
}