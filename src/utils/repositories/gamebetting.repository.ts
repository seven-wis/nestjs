import { Injectable } from "@nestjs/common";
import { GameBetting } from "src/users/entities/gamebetting.entity";
import { Repository } from "typeorm";

@Injectable()
export class GameBettingRepository extends Repository<GameBetting> { }