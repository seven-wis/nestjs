import { IsNotEmpty, IsNumber } from "class-validator";

export class AuthUserTdo
{
    AccessToken: string;
    Id  : number;
    Username : string;
    Email    : string;
    Image: string;
    FirstName : string;
    LastName  : string;
}

export enum UserStatus {
    Online = 0,
    Offline = 1,
    InGame = 2,
    Walo = -1,
}

export enum FriendshipStatus {
    non = -1,
    Isfriend = 0,
    RequestSend = 1,
    RequestRecived = 2,
}

export class UserDto {
    id: number;
    name: string;
    email?: string;
    currentAvatar?: string;

    status?: UserStatus;
    FriendshipStatus?:FriendshipStatus;

    firsName?: string;
    lastName?: string;
    wins?: number;
    loses?: number;
    score?: number;
    firstlogin?: boolean;
    twoFactAuth?: boolean;
    friends?: UserDto[];
    blocked?: UserDto[];
    friendRequest?: UserDto[];
    friendShipToken?: string;
    UnreadMessagesCount?: number;
    TimeOfLastmessage?: string;
    BotLevel?: number;
}

export class SendFriendRequestDto {
    @IsNumber()
    @IsNotEmpty()
    receiverId: number;
}

export class InfoDto {
    @IsNumber()
    @IsNotEmpty()
    friendId: number;
}

export class userInfo {
    username: string;
    sub: number;
    iat: BigInt;
    exp: BigInt;
}

export class UserUpdatedDto {
    user_username: string;
    user_firstName: string;
    user_lastName: string;
    user_avatar: string;
}