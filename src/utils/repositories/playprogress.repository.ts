import { Global, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PlayProgress } from 'src/users/entities';


@Injectable()
export class PlayProgressRepository extends Repository<PlayProgress> { }