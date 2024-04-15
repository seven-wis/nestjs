// import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
// import { User, Friendship, Profile } from './entities';
// import { InjectRepository } from '@nestjs/typeorm';
// import { FriendShipRepository, ProfileRepository, UsersRepository } from './users.repository';

// import { AuthUserTdo, UserDto, UserStatus } from '../dto';

// /*
//   @Endpoint : /users
//   @Description : This is the service of the user module. It contains all the business logic of the user module.
//   @get_user_profile
//   @get_all_users
//   @get_user_by_id
//   @is_logged_in
// */

// @Injectable()
// export class UsersService {
//   constructor(
//     @InjectRepository(User) private readonly UsersRepo: UsersRepository,
//     @InjectRepository(Friendship) private readonly FriendsRepo: FriendShipRepository,
//     @InjectRepository(Profile) private readonly ProfileRepo: ProfileRepository
//   ) { }

//   /* ############################ Create new user in the database ##########################################*/
//   async get_user_by_email(Email: string) {
//     return await this.UsersRepo.findOne({
//       where: { profile: { user_email: Email } },
//       relations: ['profile']
//     });
//   }

//   async create_user_profile(user_data: AuthUserTdo): Promise<Profile> {
//     const userProfile = new Profile();
//     userProfile.user_email = user_data.Email;
//     userProfile.user_avatar = user_data.IntraImage;
//     userProfile.user_firstName = user_data.StudentFirstName;
//     userProfile.user_lastName = user_data.StudentLastName;
//     userProfile.user_Status = 0;
//     userProfile.wins = 0;
//     userProfile.loses = 0;
//     userProfile.score = 0;
//     userProfile.firstlogin = true;
//     userProfile.twoFactAuth = false;
//     await this.ProfileRepo.save(userProfile);
//     return userProfile;
//   };

//   async create_new_user(user_data: AuthUserTdo): Promise<User> {
//     const userProfile = await this.create_user_profile.call(this, user_data);
//     if (!userProfile) {
//       throw new NotFoundException('Error while creating user profile');
//     }
//     const user = new User();
//     user.user_name = user_data.Username;
//     user.profile = userProfile;
//     return await this.UsersRepo.save(user);
//   }
//   /* ############################################################################################################ */

//   /* ################################### get all users from the database ######################################## */
//   async get_friendship_by_id(sender: number, receiver: number): Promise<Friendship> | null {
//     return await this.FriendsRepo.findOne({
//       where: [
//         { sender: { user_id: sender }, receiver: { user_id: receiver } },
//         { sender: { user_id: receiver }, receiver: { user_id: sender } }
//       ]
//     });
//   }

//   async get_all_users(currentUser_id: number): Promise<UserDto[]> {
//     const allUsers = await this.UsersRepo.find({ relations: ['profile'] });

//     const allUsersRes: UserDto[] = [];
//     for (let i = 0; i < allUsers.length; i++) {
//       const friendship: Friendship = await this.get_friendship_by_id(currentUser_id, allUsers[i].user_id);
//       if (friendship && friendship.status === 'blocked') {
//         continue;
//       }
//       allUsersRes.push({
//         id: allUsers[i].user_id,
//         name: allUsers[i].user_name,
//         currentAvatar: allUsers[i].profile.user_avatar,
//       });
//     }
//     return allUsersRes;
//   }
//   /* ############################################################################################################ */

//   /* ################################### get user profile from the database ######################################## */
//   async get_user_profile(current_user_id: number): Promise<UserDto> {
//     const user = await this.UsersRepo.findOne({
//       where: { user_id: current_user_id },
//       relations: ['profile']
//     });

//     const friends : UserDto[]   = await this.getAllFriends(current_user_id);
//     const FriendReq : UserDto[] = await this.getPendingFriendRequests(current_user_id);
//     // const blocked : UserDto[]   = await this.getblockedfriends(current_user_id);
 
//     const FrontUser: UserDto = {
//       id: user.user_id,
//       name: user.user_name,
//       email: user.profile.user_email,
//       status: user.profile.user_Status,
//       firsName: user.profile.user_firstName,
//       lastName: user.profile.user_lastName,
//       currentAvatar: user.profile.user_avatar,
//       wins: user.profile.wins,
//       loses: user.profile.loses,
//       score: user.profile.score,
//       firstlogin: user.profile.firstlogin,
//       twoFactAuth: user.profile.twoFactAuth,
//       friends: friends,
//       friendRequest: FriendReq,
//       blocked: null
//     }

//     return FrontUser;
//   }

//   async user_data(user_id: number) {
//     return await this.UsersRepo.findOne({
//       where: { user_id: user_id },
//       relations: ['profile']
//     });
//   }

//   async get_user_by_id(current_user_id: number, user_id: number) {
//     const friendship: Friendship = await this.get_friendship_by_id(current_user_id, user_id);
//     if ((friendship && friendship.status === 'blocked') || user_id == current_user_id) {
//       throw new ForbiddenException('Resource not found');
//     }

//     const friendFilter = async function (UserInfoFriends: UserDto[]): Promise<UserDto[]> {
//       for (let i = 0; i < UserInfoFriends.length; i++) {
//         const friendship: Friendship = await this.get_friendship_by_id(current_user_id, UserInfoFriends[i].id);
//         if (friendship && friendship.status === 'blocked') {
//           UserInfoFriends.splice(i, 1);
//           i--;
//         }
//       }
//       return UserInfoFriends;
//     }

//     const UserInfo: UserDto = await this.get_user_profile(user_id);
  
//     UserInfo.friends = await friendFilter.call(this, UserInfo.friends);
//     const UserInfoRes: UserDto = {
//       id: UserInfo.id,
//       name: UserInfo.name,
//       status: (friendship && friendship.status === "accepted") ? UserInfo.status : UserStatus.Walo,
//       firsName: UserInfo.firsName,
//       lastName: UserInfo.lastName,
//       currentAvatar: UserInfo.currentAvatar,
//       wins: UserInfo.wins,
//       loses: UserInfo.loses,
//       score: UserInfo.score,
//       friends: UserInfo.friends,
//     }

//     return UserInfoRes;
//   }

//   async getAllFriends(userId: number): Promise<UserDto[]> {
//     const friendships = await this.FriendsRepo.find({
//       where: [
//         {
//           sender: {
//             user_id: userId
//           }, status: 'accepted'
//         },
//         {
//           receiver: {
//             user_id: userId
//           },
//           status: 'accepted'
//         },
//       ],
//       relations: [
//         'sender', 'receiver'
//       ],
//     });

//     const FrontAllFriends: UserDto[] = [];

//     const friends = friendships.map((friendship) => { return friendship.sender.user_id == userId ? friendship.receiver : friendship.sender; });
//     for (let i = 0; i < friends.length; i++) {
//       friends[i] = await this.user_data(friends[i].user_id);
//       FrontAllFriends.push({
//         id: friends[i].user_id,
//         name: friends[i].user_name,
//         currentAvatar: friends[i].profile.user_avatar,
//         status: friends[i].profile.user_Status,
//       });
//     }

//     return FrontAllFriends;
//   }

//   async sendFriendRequest(senderId: number, receiverId: number): Promise<Friendship> {
//     const sender = await this.UsersRepo.findOne({
//       where: {
//         user_id: senderId
//       }
//     });

//     const receiver = await this.UsersRepo.findOne({
//       where: {
//         user_id: receiverId
//       }
//     });

//     if (sender && receiver && senderId !== receiverId) {
//       const existingFriendship = await this.FriendsRepo.findOne({
//         where: [
//           { sender, receiver },
//           { sender: receiver, receiver: sender },
//         ],
//       });
//       if (!existingFriendship) {
//         const newFriendRequest = this.FriendsRepo.create({
//           sender,
//           receiver,
//           friend: receiver,
//           status: 'pending',
//         });
//         return await this.FriendsRepo.save(newFriendRequest);
//       }
//     }
//     throw new ForbiddenException('Request rejected Because the user is already a friend or the user does not exist');
//   }

//   async getPendingFriendRequests(currentUserId: number): Promise<UserDto[]> {
//     const currentUser = await this.UsersRepo.findOne({
//       where: { user_id: currentUserId }
//     });

//     if (currentUser) {
//       // // console.log(currentUser);
//       const pendingFriendRequests = await this.FriendsRepo.find({
//         where: {
//           receiver: currentUser,
//           status: 'pending',
//         },
//         relations: ['sender'],
//       });

//       const FriendReq: UserDto[] = [];

//       for (let i = 0; i < pendingFriendRequests.length; i++) {
//         const user = await this.user_data(pendingFriendRequests[i].sender.user_id);
//         FriendReq.push({
//           id: user.user_id,
//           name: user.user_name,
//           currentAvatar: user.profile.user_avatar,
//           status: user.profile.user_Status,
//         });
//       }
//       return FriendReq;
//     }
//     throw new NotFoundException('User not found');
//   }

//   async acceptFriendRequest(currentUserId: number, friendId: number) {
//     const currentUser = await this.UsersRepo.findOne({ where: { user_id: currentUserId } });
//     const friend = await this.UsersRepo.findOne({ where: { user_id: friendId } });

//     if (currentUser && friend) {
//       const friendshipToAccept = await this.FriendsRepo.findOne({
//         where: [
//           { sender: friend, receiver: currentUser },
//           { sender: currentUser, receiver: friend },
//         ],
//         relations: ['sender', 'receiver'],
//       });

//       if (friendshipToAccept && friendshipToAccept.status === 'pending') {
//         friendshipToAccept.status = 'accepted';
//         return await this.FriendsRepo.save(friendshipToAccept);
//       } else {
//         throw new NotFoundException('Friendship not found');
//       }
//     }
//     throw new NotFoundException('Friendship not found');
//   }

//   async deleteFriend(currentUserId: number, friendId: number) {
//     const currentUser = await this.UsersRepo.findOne({ where: { user_id: currentUserId } });
//     const friend = await this.UsersRepo.findOne({ where: { user_id: friendId } });

//     if (currentUser && friend) {
//       const friendshipToRemove = await this.FriendsRepo.findOne({
//         where: [
//           { sender: currentUser, receiver: friend },
//           { sender: friend, receiver: currentUser },
//         ],
//         relations: ['sender', 'receiver'],
//       });

//       if (friendshipToRemove) {
//         return await this.FriendsRepo.remove(friendshipToRemove);
//       }
//     }
//     throw new NotFoundException('Friendship not found');
//   }

//   async blockfriend(currentUserId: number, friendId: number) {
//     const currentUser = await this.UsersRepo.findOne({ where: { user_id: currentUserId } });
//     const friend = await this.UsersRepo.findOne({ where: { user_id: friendId } });

//     if (currentUser && friend) {
//       const friendshipToBlock = await this.FriendsRepo.findOne({
//         where: [
//           { sender: currentUser, receiver: friend },
//           { sender: friend, receiver: currentUser },
//         ],
//         relations: ['sender', 'receiver'],
//       });

//       if (friendshipToBlock) {
//           friendshipToBlock.status = 'blocked';
//           friendshipToBlock.blockedBy = currentUser;
//           return await this.FriendsRepo.save(friendshipToBlock);
//       }
//     }
//     throw new NotFoundException('Friendship not found');
//   }

//   async unblockfriend(currentUserId: number, friendId: number) {
//     const currentUser = await this.UsersRepo.findOne({ where: { user_id: currentUserId } });
//     const friend = await this.UsersRepo.findOne({ where: { user_id: friendId } });

//     if (currentUser && friend) {
//       const friendshipToBlock = await this.FriendsRepo.findOne({
//         where: [
//           { sender: currentUser, receiver: friend },
//           { sender: friend, receiver: currentUser },
//         ],
//         relations: ['sender', 'receiver'],
//       });

//       if (friendshipToBlock) {
//         friendshipToBlock.status = 'accepted';
//         friendshipToBlock.blockedBy = null;
//         return await this.FriendsRepo.save(friendshipToBlock);
//       }
//     }
//     throw new NotFoundException('Friendship not found');
//   }

//   async getblockedfriends(currentUserId: number) {
//     const currentUser = await this.UsersRepo.findOne({ where: { user_id: currentUserId } });

//     if (currentUser) {
//       const blockedFriends = await this.FriendsRepo.find({
//         where: {
//           sender: currentUser,
//           status: 'blocked',
//         },
//         relations: ['blockedBy'],
//       });
//     }
//     throw new NotFoundException('User not found');
//   }
// }
