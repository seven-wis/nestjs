import { Controller, Get, Param, UseGuards, Post, Body, Delete, Put, UseFilters, HttpException, HttpStatus } from '@nestjs/common';
import { Friendship } from './entities/friendship.entity';
import { AlreadyLoggedInGuard } from '../utils/guards/auth.guard';
import { CurrentUser } from '../utils/decorator/userInfo.decorator';
import { InfoDto, SendFriendRequestDto, UserDto, UserUpdatedDto, userInfo } from 'src/utils/dto';
import { UsersService } from './services/users.service';
import { FriendReqService } from './services/friendreq.service';
import { ProfileService } from './services/profile.service';
import { BlockService } from './services/block.service';
import { ApiTags } from '@nestjs/swagger';
import e from 'express';

@ApiTags('users')
@UseGuards(AlreadyLoggedInGuard)
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly friendReqService: FriendReqService,
        private readonly profileService: ProfileService,
        private readonly blockService: BlockService
    ) { }


    @Get("statistics/:user_id")
    async get_statistics(@CurrentUser() Currentuser, @Param("user_id") user_id: number) {
        try {
            return await this.usersService.get_user_statistics(user_id);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("achievements")
    async get_achievements(@CurrentUser() Currentuser) {
        try {
            await this.usersService.get_achievements(Currentuser.sub);
            return ("achievements");
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("levelinfo/:user_id")
    async get_level_info(@CurrentUser() Currentuser, @Param("user_id") user_id: number) {
        try {
            return await this.usersService.get_user_progress(user_id);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("match/:user_id")
    test(@CurrentUser() Currentuser, @Param("user_id") user_id: number) {
        try {
            return this.usersService.get_user_matches(user_id);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("isloggedin")
    isloggedin(@CurrentUser() Currentuser) {
    }

    @Get()
    async get_all_users(@CurrentUser() Currentuser) {
        try {
            const current_user_id: number = Currentuser.sub;
            return await this.profileService.get_all_users(current_user_id);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("leaderboard")
    async get_leaderboard() {
        try {
            return await this.usersService.get_leaderboard();
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("profile")
    async get_user_profile(@CurrentUser() Currentuser) {
        try {
            const current_user_id: number = Currentuser.sub;
            return await this.profileService.get_user_profile(Currentuser.sub);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("email/:email")
    async get_user_by_email(@Param("email") Email: string) {
        try {
            return await this.usersService.get_user_by_email(Email);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("id/:id")
    async get_user_by_id(@CurrentUser() Currentuser, @Param("id") user_id: number) {
        try {
            const current_user_id: number = Currentuser.sub;
            return await this.profileService.get_user_by_id(current_user_id, user_id);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Put("update")
    async update_user(@CurrentUser() Currentuser: userInfo, @Body() UserUpdatedInfo: UserUpdatedDto) {
        try {
            return await this.profileService.update_user(Currentuser.sub, UserUpdatedInfo);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    /* ####################################################################### ["Friends", "Friendrequest", "Blocked"] */
    @Get("friends")
    async getFriends(@CurrentUser() Currentuser) {
        try {
            const current_user_id: number = Currentuser.sub;
            const friends = this.profileService.getAllFriends(current_user_id);
            return (await friends);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("getPendingFriendRequests")
    async getPendingFriendRequests(@CurrentUser() Currentuser: userInfo): Promise<UserDto[]> {
        try {
            const current_user_id: number = Currentuser.sub;
            const PendingFriendRequests = this.friendReqService.getPendingFriendRequests(current_user_id);
            return (await PendingFriendRequests);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get("getBlockedFriends")
    async getBlockedFriends(@CurrentUser() Currentuser: userInfo): Promise<UserDto[]> {
        try {
            const current_user_id: number = Currentuser.sub;
            const BlockedFriends = this.blockService.getblockedfriends(current_user_id);
            return (await BlockedFriends)
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }
    /* ###############################################################################################################  */

    /* ###################################################################### FriendShip managment ###################  */
    @Post("sendFriendRequest")
    async sendFriendRequest(@CurrentUser() Currentuser: userInfo, @Body() FriendRequest: SendFriendRequestDto): Promise<Friendship> {
        try {
            const current_user_id: number = Currentuser.sub;
            return await this.friendReqService.sendFriendRequest(current_user_id, FriendRequest.receiverId);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Post("acceptFriendRequest")
    async acceptFriendRequest(@CurrentUser() Currentuser: userInfo, @Body() FriendRequest: InfoDto) {
        try {
            const current_user_id: number = Currentuser.sub;
            return await this.friendReqService.acceptFriendRequest(current_user_id, FriendRequest.friendId);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Post("rejectFriendRequest")
    async rejectFriendRequest(@CurrentUser() Currentuser: userInfo, @Body() FriendRequest: InfoDto) {
        try {
            const current_user_id: number = Currentuser.sub;
            return await this.friendReqService.rejectFriendRequest(current_user_id, FriendRequest.friendId);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Delete("deleteFriend/:id")
    async deleteFriend(@CurrentUser() Currentuser: userInfo, @Param("id") friendId: number) {
        try {
            const current_user_id: number = Currentuser.sub;
            return await this.friendReqService.deleteFriend(current_user_id, friendId);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Post("unblockFriend")
    async unblockFriend(@CurrentUser() Currentuser: userInfo, @Body() FriendRequest: InfoDto) {
        try {
            const current_user_id: number = Currentuser.sub;
            return await this.blockService.unblockfriend(current_user_id, FriendRequest.friendId);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Post("blockFriend")
    async blockFriend(@CurrentUser() Currentuser: userInfo, @Body() FriendRequest: InfoDto) {
        try {
            const current_user_id: number = Currentuser.sub;
            return await this.blockService.blockfriend(current_user_id, FriendRequest.friendId);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }
}
