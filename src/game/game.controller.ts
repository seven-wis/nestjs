import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GameHistoryRepository } from 'src/utils/repositories';
import { AlreadyLoggedInGuard } from 'src/utils/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('game')
@UseGuards(AlreadyLoggedInGuard)
@Controller('game')
export class GameController {
    constructor(
        private readonly gameService: GameService,
    ) { }

    @Post("create_new_game")
    async create_New_Game(@Body() createGameDto: CreateGameDto) {
        try {
            const res = await this.gameService.create_New_Game(createGameDto);
            if (res) {
                return res;
            }
            return "Error";
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Post("save_game")
    async saveGame(@Body() result: any) {
        try {
            return await this.gameService.saveGame({
                gameInfo: result.gameInfo,
                result: result.result
            });

        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("/matchs")
    async get() {
        try {
            return await this.gameService.getmatches();
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("/match/:id")
    async getMatch(@Param("id") id: number) {
        try {
            return await this.gameService.getMatch(id);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }
}
