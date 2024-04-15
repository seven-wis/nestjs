import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GameBetting } from "../entities/gamebetting.entity";
import { GameBettingRepository } from "src/utils/repositories/gamebetting.repository";
import { UsersService } from "./users.service";
import { ProfileGatewayService } from "src/websockets/profile-gateway/profileGateway.service";

@Injectable()
export class BettingService {
    constructor(
        @InjectRepository(GameBetting) private readonly bettingRepository: GameBettingRepository,
        @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
        @Inject(forwardRef(() => ProfileGatewayService)) private readonly profileGatewayService: ProfileGatewayService,

    ) { }

    async createBetting(userId: number, bettingObject: any) {
        console.log("createBetting -> betObj : ", bettingObject);

        const user = await this.usersService.user_data(userId);
        if (user) {
            const betting = await this.bettingRepository.find({
                where: {
                    userId: user.user_id,
                    gameId: bettingObject.gameId,
                    status: 'pending',
                },
            });

            console.log("createBetting -> betting : ", betting.length, userId);

            if (betting.length == 0) {
                if (user.profile && user.profile.score >= bettingObject.bettingValue) {
                    const newBetting = new GameBetting();
                    newBetting.userId = user.user_id;
                    newBetting.gameId = bettingObject.gameId;
                    newBetting.bettingValue = bettingObject.bettingValue;
                    newBetting.betOn = bettingObject.betOn;
                    newBetting.status = 'pending';
                    const bettingRes = await this.bettingRepository.save(newBetting);
                    if (bettingRes) {
                        await this.usersService.add_new_score(user.user_id, bettingObject.bettingValue * -1);
                        await this.profileGatewayService.EmitMessage("all", "bettingDone", { game: "" });
                        await this.profileGatewayService.EmitMessage("all", "matchOver", { game: "" });
                    }
                }
            }
        }
    }

    async bet_calculator(gameId: number, winner: number) {
        const betting = await this.bettingRepository.find({
            where: {
                gameId: gameId,
                status: 'pending',
            },
        });

        if (betting.length > 0) {

            await this.bettingRepository.update({ gameId: gameId }, { status: 'done' });

            var allBetValue = 0;
            var winnerBetValue = 0;
            var winBetters: GameBetting[] = [];

            for (let i = 0; i < betting.length; i++) {
                if (betting[i].betOn == winner) {
                    winnerBetValue += betting[i].bettingValue;
                    winBetters.push(betting[i]);
                }
                allBetValue += betting[i].bettingValue;
            }

            console.log("bet_calculator -> winBetters : ", winBetters);
            console.log("bet_calculator -> winner : ", winner);

            winBetters.forEach(async (bet) => {
                const bettingPercent = Math.floor(bet.bettingValue / winnerBetValue) * 100;
                const newScore = Math.floor((bettingPercent / 100) * allBetValue);

                const user = await this.usersService.user_data(bet.userId);
                if (user) {
                    await this.usersService.add_new_score(bet.userId, newScore);
                }
            });
        
            await this.profileGatewayService.EmitMessage("all", "matchOver", { game: "" });
        }
    }
}