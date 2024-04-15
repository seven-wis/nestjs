import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Profile } from "./profile.entity";

@Entity()
export class PlayProgress {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 0 })
    level: number;

    @Column({ default: 0 })
    nextLevelPercent: number;

    @Column({ default: "wood"})
    league: string;

    @OneToOne(() => Profile, (profile) => profile.Progress, {cascade: true, onDelete: 'CASCADE'})
    @JoinColumn()
    profile: Profile;
}