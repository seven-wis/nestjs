import { Delete, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileService } from 'src/users/services/profile.service';
import { UserDto } from 'src/utils/dto';
import { Friendship } from '../../users/entities';
import { FriendReqService } from '../../users/services/friendreq.service';
import { UsersService } from '../../users/services/users.service';
import { FriendShipRepository, PrivateChatRepository } from '../../utils/repositories';
import { PrivateChat } from '../entities/privatechat.entity';

export interface MessageDto {
    messageId: number;
    userId: number;
    userName: string;
    userAvatar?: string;
    time: string;
    message: string;
};

@Injectable()
export class PrivateChatService {
    constructor(
        @InjectRepository(PrivateChat) private readonly privateChatRepository: PrivateChatRepository,
        @InjectRepository(Friendship) private readonly friendshipRepository: FriendShipRepository,
        @Inject(forwardRef(() => FriendReqService)) private readonly friendReqService: FriendReqService,

        // private readonly usersService: UsersService,
        @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
        @Inject(forwardRef(() => ProfileService)) private readonly profileService: ProfileService,

        // private readonly profileService: ProfileService
    ) { }

    timeFormat = (dateString: string) => {
        const dateObject = new Date(dateString);
        const formattedDate = dateObject.toLocaleString('en-US', {
            //   year: 'numeric',
            //   month: '2-digit',
            //   day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
        return formattedDate;
    }
    async createNewMessage(sender_id: number, receiver_id: number, message_content: string) {
        const user = await this.usersService.user_data(sender_id);
        const friend = await this.usersService.user_data(receiver_id);

        if (user && friend && user.user_id !== friend.user_id) {
            const friendship = await this.friendReqService.getFriendShip(user.user_id, friend.user_id);
            if (friendship && friendship.status === ('accepted' as string)) {
                const newMessage = new PrivateChat();
                newMessage.sender = user;
                newMessage.receiver = friend;
                newMessage.content = message_content;
                newMessage.friendship = friendship;
                newMessage.timestamp = new Date();
                const savedMessage = await this.privateChatRepository.save(newMessage);
                if (savedMessage) {
                    return ({
                        messageId: savedMessage.message_id,
                        userId: savedMessage.sender.user_id,
                        userName: savedMessage.sender.user_name,
                        userAvatar: savedMessage.sender.profile.user_avatar,
                        time: this.timeFormat(savedMessage.timestamp.toISOString()),
                        fullTime: savedMessage.timestamp.toISOString(),
                        message: savedMessage.content
                    });
                }
                return null;
            }
        }

        throw new Error("Friendship not found");
    }

    async DeleteMessage(message_id: number) {
        const message = await this.privateChatRepository.findOne({
            where: { message_id: message_id },
            relations: ['friendship'],
        });

        if (message) {
            await this.privateChatRepository.remove(message);
        }
    }

    async getMessageCount(user_id: number, friend_id: number): Promise<number> {
        const user = await this.usersService.user_data(user_id);
        const friend = await this.usersService.user_data(friend_id);

        if (user && friend) {
            const friendship = await this.friendReqService.getFriendShip(user.user_id, friend.user_id);

            if (friendship) {
                const f = await this.friendshipRepository.findOne({
                    where: [
                        { id: friendship.id, messages: { isRead: false, receiver: { user_id: user_id } } },
                    ],
                    relations: ['messages', 'messages.sender', "messages.sender.profile"],
                });
                if (f) {
                    return f.messages.length;
                }
            }
        }
        return 0;
    }

    async markAsRead(user_id: number, friend_id: number) {
        if (user_id !== undefined && friend_id !== undefined) {
            const user = await this.usersService.user_data(user_id);
            const friend = await this.usersService.user_data(friend_id);

            if (user && friend) {
                return await this.privateChatRepository.update(
                    {
                        receiver: {
                            user_id: user_id
                        },
                        sender: {
                            user_id: friend_id
                        },
                        isRead: false
                    },
                    {
                        isRead: true
                    }
                );
            }
        }
        throw new Error("User not found");
    }

    async getMessages(user_id: number, friend_id: number): Promise<MessageDto[]> {
        const user = await this.usersService.user_data(user_id);
        const friend = await this.usersService.user_data(friend_id);

        if (user && friend) {
            const friendship = await this.friendReqService.getFriendShip(user.user_id, friend.user_id);

            if (friendship) {
                const f = await this.friendshipRepository.findOne({
                    where: [
                        { id: friendship.id /*, messages: { isRead: false }*/ },
                    ],
                    //{ id: friendship.id }, // old code
                    relations: ['messages', 'messages.sender', "messages.sender.profile"],
                });
                if (f) {
                    const messages = f.messages;
                    let UserMessages: MessageDto[] = [];
                    messages.map((message) => {
                        UserMessages.push({
                            messageId: message.message_id,
                            userId: message.sender.user_id,
                            userName: message.sender.user_name,
                            userAvatar: message.sender.profile.user_avatar,
                            time: this.timeFormat(message.timestamp.toISOString()),
                            message: message.content
                        });
                    });
                    return (UserMessages);
                }
            }
        }
        return [];
    }


    async getCurrentUserPm(current_user_id: number): Promise<UserDto[]> {
        const current_user = await this.usersService.user_data(current_user_id);
        if (current_user) {
            const friendshipsWithMessages = await this.friendshipRepository.find({
                relations: ['messages', 'sender', 'receiver'],
                where: [
                    { sender: { user_id: current_user.user_id }, status: 'accepted'    /*, messages: { content: '' }*/ },
                    { receiver: { user_id: current_user.user_id }, status: 'accepted'  /*, messages: { content: '' }*/ },
                ],
                order: {
                    messages: {
                        timestamp: "DESC"
                    }
                }
            });

            let friends: UserDto[] = [];
            for (let i = 0; i < friendshipsWithMessages.length; i++) {
                if (friendshipsWithMessages[i].messages.length > 0) {
                    let user_data;
                    if (friendshipsWithMessages[i].sender.user_id === current_user_id) {
                        user_data = await this.usersService.user_data(friendshipsWithMessages[i].receiver.user_id);
                    } else {
                        user_data = await this.usersService.user_data(friendshipsWithMessages[i].sender.user_id);
                    }
                    const MessageCount = await this.getMessageCount(current_user_id, user_data.user_id);
                    friends.push({
                        id: user_data.user_id,
                        name: user_data.user_name,
                        currentAvatar: user_data.profile.user_avatar,
                        status: user_data.profile.user_Status,
                        friendShipToken: friendshipsWithMessages[i].friendshiptoekn,
                        UnreadMessagesCount: MessageCount,
                        TimeOfLastmessage: (friendshipsWithMessages[i].messages[0]) ? (friendshipsWithMessages[i].messages[0].timestamp.toISOString()) : ""
                    });
                }
            }
            return (friends);
        }
        return ([]);
    }
}
