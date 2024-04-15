export declare class RoomInfo {
    roomId?: number;
    current_user_id: number;
    roomName: string;
    roomType: string;
    roomPassword: string;
}
export declare class RoomMessage {
}
export declare enum ChannelType {
    none = 0,
    publicChannel = 1,
    protectedChannel = 2,
    privateChannel = 3,
    privateMessage = 4
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
    users?: any;
}
