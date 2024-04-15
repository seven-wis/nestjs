import { Global, Injectable } from '@nestjs/common';
import { Statistics } from 'src/users/entities';
import { Repository } from 'typeorm';

@Injectable()
export class StatisticRepository extends Repository<Statistics> { }