import { Global, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities';


@Injectable()
export class UsersRepository extends Repository<User> { }