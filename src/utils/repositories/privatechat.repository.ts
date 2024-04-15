import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PrivateChat } from 'src/chat/entities/privatechat.entity';


@Injectable()
export class PrivateChatRepository extends Repository<PrivateChat> { }