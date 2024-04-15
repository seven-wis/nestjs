export class RoomInfo {
    roomId?: number;
    current_user_id: number;
    roomName: string;
    roomType: string;
    roomPassword: string;
}

export class RoomMessage {

}

export enum ChannelType {
    none = 0,
    publicChannel = 1,
    protectedChannel = 2,
    privateChannel = 3,
    privateMessage = 4,
}

export interface RoomDto {
    roomId: number;
    roomName: string;
    ChannelType: number;
    ownerAvatar?: string;
    numberOfMembers?: number;
    owner: number;
    InRoom?: boolean;
    UnreadMessagesCount?: number;
    TimeOfLastMessage?: string;
    users?;
};