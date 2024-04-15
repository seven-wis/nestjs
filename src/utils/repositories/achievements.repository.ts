import { Global, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Achievements } from 'src/users/entities';

@Injectable()
export class AchievementsRepository extends Repository<Achievements> { }