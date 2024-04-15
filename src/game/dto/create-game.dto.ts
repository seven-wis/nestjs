import { IsNotEmpty } from "class-validator";

export class CreateGameDto {
    @IsNotEmpty()
    id1: number;

    @IsNotEmpty()
    id2: number;

    @IsNotEmpty()
    roomId: string;

    @IsNotEmpty()
    gameType: string;
}
