import { GameBettingRepository } from "src/utils/repositories/gamebetting.repository";
import { UsersService } from "./users.service";
import { ProfileGatewayService } from "src/websockets/profile-gateway/profileGateway.service";
export declare class BettingService {
    private readonly bettingRepository;
    private readonly usersService;
    private readonly profileGatewayService;
    constructor(bettingRepository: GameBettingRepository, usersService: UsersService, profileGatewayService: ProfileGatewayService);
    createBetting(userId: number, bettingObject: any): Promise<void>;
    bet_calculator(gameId: number, winner: number): Promise<void>;
}
