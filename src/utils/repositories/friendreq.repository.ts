import { Global, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User, Friendship, Profile } from 'src/users/entities';
import { UsersRepository } from './users.repository';


@Injectable()
export class FriendShipRepository extends Repository<Friendship> {
    async GetFriendship(sender_id: number, receiver_id: number) {
        const sender: User = await UsersRepository.call('getUserById', sender_id);
        const receiver: User = await UsersRepository.call('getUserById', receiver_id);
        return await this.findOne({
            where: [
                { sender: sender, receiver: receiver },
                { sender: receiver, receiver: sender },
            ],
            relations: ['sender', 'receiver'],
        });
    }
}