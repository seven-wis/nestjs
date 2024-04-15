export type PlayerBody = {
    userId: number;
    userScode: number;
};
export type GameHistoryResult = {
    Player1: PlayerBody;
    Player2: PlayerBody;
};
export type Ball = {
    x: number;
    y: number;
    radius: number;
    speed: number;
    velocityX: number;
    velocityY: number;
};
export type Obstacle = {
    x: number;
    y: number;
    width: number;
    height: number;
};
export type Player = {
    x: number;
    y: number;
    width: number;
    height: number;
    socketID?: string;
    userID?: number;
    userName: string;
    arrowDown?: boolean;
    arrowUp?: boolean;
    score: number;
};
export type GameObject = {
    player1: Player;
    player2: Player;
    ball: Ball;
    obstacle?: Obstacle;
    gameID: string;
    gameStatus: string;
    gameWinner: string;
    gameLoser: string;
};
