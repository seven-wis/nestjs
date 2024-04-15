import { Global, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User, Friendship, Profile } from 'src/users/entities';


@Injectable()
export class ProfileRepository extends Repository<Profile> { }