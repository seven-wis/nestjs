import { Injectable } from "@nestjs/common";
import { GameHistory } from "src/game/entities/game.entity";
import { Repository } from "typeorm";

@Injectable()
export class GameHistoryRepository extends Repository<GameHistory> { }