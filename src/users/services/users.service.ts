import { Inject, Injectable, NotFoundException, UseFilters, forwardRef } from '@nestjs/common';
import { User, Friendship, Profile, PlayProgress } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendShipRepository, ProfileRepository, StatisticRepository, UsersRepository } from 'src/utils/repositories';
import { AuthUserTdo } from 'src/utils/dto';
import { PlayerBody } from 'src/game/game.service';
import { Match } from 'src/game/game.service';
import { GameHistory } from 'src/game/entities/game.entity';
import { PlayProgressRepository } from 'src/utils/repositories/playprogress.repository';
import { Statistics } from 'src/users/entities';
import { AchievementsService } from './achievment.service';
import { ACHIEVEMENT_LEVELS, ACHIEVEMENT_LIST, LEAGUES, LEAGUES_COLORS } from 'src/utils/constant/achievement.constant';
import { ProfileGatewayService } from 'src/websockets/profile-gateway/profileGateway.service';

export interface userDatashboad {
    user_id: number;
    user_name: string;
    user_avatar: string;
    user_Score: number;
}

export type achieve = {
    img: string;
    name: string;
    time: string;
    unlocked: boolean;

}

export type LevelInfo = {
    league: string;
    wins: number;
    loses: number;
    level: number;
    precLevel: number;
    MainLevelColor: string;
    BgLevelColor: string;
    achievement: achieve[];
}

export type UserStatistic = {
    time: string[];
    score: number[];
    matchs: number[];
}



@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly UsersRepo: UsersRepository,
        @InjectRepository(Friendship) private readonly FriendsRepo: FriendShipRepository,
        @InjectRepository(Profile) private readonly ProfileRepo: ProfileRepository,
        @InjectRepository(PlayProgress) private readonly PlayProgressRepo: PlayProgressRepository,
        @InjectRepository(Statistics) private statisticRepository: StatisticRepository,
        @Inject(forwardRef(() => ProfileGatewayService)) private readonly profileGatewayService: ProfileGatewayService,
        private readonly acheivmentService: AchievementsService,
    ) { }

    async get_user_by_email(Email: string) {
        const user = await this.UsersRepo.findOne({
            where: { profile: { user_email: Email } },
            relations: ['profile']
        });

        const userProfile = await this.ProfileRepo.findOne({
            where: { user_email: Email }
        });

        return {
            user: user,
            profile: userProfile
        };
    }

    async create_player_progress(): Promise<PlayProgress> {
        const playerProgress = new PlayProgress();
        await this.PlayProgressRepo.save(playerProgress);
        return playerProgress;
    }

    async create_user_profile(user_data: AuthUserTdo): Promise<Profile> {
        const userProfile = new Profile();
        userProfile.user_email = user_data.Email;
        userProfile.user_avatar = user_data.Image;
        userProfile.user_firstName = user_data.FirstName;
        userProfile.user_lastName = user_data.LastName;
        userProfile.user_Status = 0;
        userProfile.wins = 0;
        userProfile.loses = 0;
        userProfile.score = 0;
        userProfile.firstlogin = true;
        userProfile.twoFactAuth = false;
        userProfile.Progress = await this.create_player_progress.call(this);
        const res = await this.ProfileRepo.save(userProfile);
        if (res) {
            userProfile.Progress.profile = res;
            await this.PlayProgressRepo.save(userProfile.Progress);
        }
        return userProfile;
    };

    async create_new_user(user_data: AuthUserTdo): Promise<User> {
        const usernameGenerated = (username, length) => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return username + result;
        };

        const userProfile = await this.create_user_profile.call(this, user_data);
        if (!userProfile) {
            throw new NotFoundException('Error while creating user profile');
        }
        const user = new User();
        user.user_name = user_data.Username;
        user.profile = userProfile;
        if ((await this.UsersRepo.findOne({ where: { user_name: user_data.Username } }))) {
            user.user_name = usernameGenerated(user_data.Username, 5);
        }
        const res = await this.UsersRepo.save(user);
        if (res) {
            userProfile.user = res;
            await this.ProfileRepo.save(userProfile);
            await this.acheivmentService.createAchievement(res.user_id, 0);
            await this.profileGatewayService.EmitMessage("all", "newUser", { user: "" });
        }
        return res;
    }

    async user_data(user_id: number) {
        return await this.UsersRepo.findOne({
            where: { user_id },
            relations: ['profile'],
        });
    }

    async get_current_rooms(user_id: number) {
        return await this.UsersRepo.findOne({
            where: {
                user_id: user_id
            },
            relations: ['profile', 'rooms'],
        });
    }


    async update_bot_level(user_id: number, level: number) {
        const userProfile = await this.ProfileRepo.findOne({
            where: { id: user_id }
        });

        if (userProfile) {
            userProfile.BotLevel += (level / 100);
            if (userProfile.BotLevel > 1) {
                userProfile.BotLevel = 1;
            }
            return await this.ProfileRepo.save(userProfile);
        }
        return null;
    }

    async update_level(user_id: number) {
        const userProfile = await this.ProfileRepo.findOne({
            where: { id: user_id }
        });

        if (userProfile) {
            const PlayerProgress = await this.PlayProgressRepo.findOne({
                where: { profile: { id: userProfile.id } }
            });

            if (PlayerProgress) {
                const current_level = PlayerProgress.level;
                if (userProfile.Maxscore < 10) {
                    PlayerProgress.level = 0;
                    PlayerProgress.nextLevelPercent = userProfile.Maxscore * 10;
                } else {
                    const power = Math.floor(Math.log2(userProfile.Maxscore / 10));
                    PlayerProgress.level = power + 1;
                    const lvScore = Math.pow(2, power) * 10;
                    const RestScore = userProfile.Maxscore - lvScore;
                    PlayerProgress.nextLevelPercent = Math.floor((RestScore / lvScore) * 100);
                    if (LEAGUES.has(PlayerProgress.level)) {
                        PlayerProgress.league = LEAGUES.get(PlayerProgress.level);
                    }
                }

                if (ACHIEVEMENT_LEVELS.includes(PlayerProgress.level) && current_level != PlayerProgress.level) {

                    for (let level = current_level; level <= PlayerProgress.level; level++) {
                        if (ACHIEVEMENT_LEVELS.includes(level) && current_level != level) {
                            await this.acheivmentService.createAchievement(user_id, ACHIEVEMENT_LEVELS.indexOf(level) + 1);
                        }
                    }
                    // await this.acheivmentService.createAchievement(user_id, ACHIEVEMENT_LEVELS.indexOf(PlayerProgress.level) + 1);
                }

                return await this.PlayProgressRepo.save(PlayerProgress);
            }
        }

        return null;
    }

    async add_new_score(user_id: number, score: number) {
        const userProfile = await this.ProfileRepo.findOne({
            where: { id: user_id }
        });

        if (userProfile) {
            userProfile.score += score;
            if (score > 0) {
                userProfile.Maxscore += score;
            }

            const res = await this.ProfileRepo.save(userProfile);
            if (res) {
                return await this.update_level(user_id);
            }

            // const res = await this.ProfileRepo.save(userProfile);
            // if (res) {
            //     const PlayerProgress = await this.PlayProgressRepo.findOne({
            //         where: { profile: { id: userProfile.id } }
            //     });

            //     const current_level = PlayerProgress.level;
            //     if (res.score < 10) {
            //         PlayerProgress.level = 0;
            //         PlayerProgress.nextLevelPercent = res.score * 10;
            //     } else {
            //         const power = Math.floor(Math.log2(res.score / 10));
            //         PlayerProgress.level = power + 1;
            //         const lvScore = Math.pow(2, power) * 10;
            //         const RestScore = res.score - lvScore;
            //         PlayerProgress.nextLevelPercent = Math.floor((RestScore / lvScore) * 100);
            //         if (LEAGUES.has(PlayerProgress.level)) {
            //             PlayerProgress.league = LEAGUES.get(PlayerProgress.level);
            //         }
            //     }

            //     if (ACHIEVEMENT_LEVELS.includes(PlayerProgress.level) && current_level != PlayerProgress.level) {
            //         this.acheivmentService.createAchievement(user_id, ACHIEVEMENT_LEVELS.indexOf(PlayerProgress.level) + 1);
            //     }

            //     return await this.PlayProgressRepo.save(PlayerProgress);
            // }
        }
        return null;
    }

    async update_user_statistic(user_id: number, winner: boolean) {
        const user = await this.UsersRepo.findOne({
            where: { user_id },
            relations: ["profile"],
        });
        if (user) {
            // format date yyyy-mm-dd
            const profile = await this.ProfileRepo.findOne({ where: { id: user_id } });

            profile.wins += winner ? 1 : 0;
            profile.loses += winner ? 0 : 1;

            await this.ProfileRepo.save(profile);

            const date = new Date().toISOString().split('T')[0];
            const statistic = await this.statisticRepository.findOne({
                where: { Player: { user_id }, date: date },
            });

            if (statistic) {
                statistic.totalScore = user.profile.score;
                statistic.totalMatches++;
                if (winner) {
                    statistic.totalWins++;
                } else {
                    statistic.totalLoses++;
                }
                return await this.statisticRepository.save(statistic);
            } else {
                const newStatistic = new Statistics();
                newStatistic.date = date;
                newStatistic.Player = user;
                newStatistic.totalScore = user.profile.score;
                newStatistic.totalMatches++;
                if (winner) {
                    newStatistic.totalWins = 1;
                } else {
                    newStatistic.totalLoses = 1;
                }

                return await this.statisticRepository.save(newStatistic);
            }
        }
    }

    async get_user_score(user_id: number): Promise<{ user_id: number, score: number }> {
        const userProfile = await this.ProfileRepo.findOne({
            where: { id: user_id },
        });
        if (userProfile) {
            return { user_id: user_id, score: userProfile.score };
        }
        return { user_id: -1, score: -1 };
    }

    async add_match(user_id: number, match: GameHistory) {
        const user = await this.UsersRepo.findOne({
            where: { user_id },
            relations: ['profile', 'matches'],
        });

        const userProfile = await this.ProfileRepo.findOne({
            where: { id: user_id }
        });

        if (user && userProfile) {
            if (!user.matches)
                user.matches = [];

            user.matches.push(match);


            await this.ProfileRepo.save(userProfile);
            return await this.UsersRepo.save(user);
            return "done";
        }
    }

    async update_status(user_id: number, status: number) {
        const user = await this.UsersRepo.findOne({
            where: { user_id },
            relations: ['profile'],
        });

        const userProfile = await this.ProfileRepo.findOne({
            where: { id: user_id }
        });

        if (!user) {
            return false
            // throw new NotFoundException('User not found'); // khasha chi 7al!
        }
        userProfile.user_Status = status;
        const res = await this.ProfileRepo.save(userProfile);
        if (res) {
            this.profileGatewayService.EmitMessage("all", "friendsUpdate", {});
        }
    }

    async get_leaderboard() {
        const users = await this.UsersRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.profile', 'profile')
            .orderBy('profile.score', 'DESC')
            .getMany();

        if (users) {
            const leaderboard: userDatashboad[] = [];
            users.forEach((user) => {
                leaderboard.push({
                    user_id: user.user_id,
                    user_name: user.user_name,
                    user_avatar: user.profile.user_avatar,
                    user_Score: user.profile.score
                });
            });
            return leaderboard;
        }
        return [];
    }

    async get_user_matches(user_id: number) {
        const user = await this.UsersRepo.findOne({
            where: { user_id },
            relations: ['profile', 'matches', 'matches.Player', 'matches.Player.profile'],
        });

        console.log("get_user_matches start");

        var matchs: Match[] = [];
        if (user) {
            const all = user.matches;
            if (all) {

                for (const game of all) {
                    var Player1: PlayerBody, Player2: PlayerBody;

                    Player1 = {
                        userId: game.Player[0].user_id,
                        userName: game.Player[0].user_name,
                        userAvatar: game.Player[0].profile.user_avatar,
                        userScode: game.result.Player1.userId == game.Player[0].user_id ? game.result.Player1.userScode : game.result.Player2.userScode,
                    }

                    if (game.Player1 != -1) {
                        Player2 = {
                            userId: game.Player[1].user_id,
                            userName: game.Player[1].user_name,
                            userAvatar: game.Player[1].profile.user_avatar,
                            userScode: game.result.Player2.userId == game.Player[1].user_id ? game.result.Player2.userScode : game.result.Player1.userScode,
                        }
                    } else {
                        Player2 = {
                            userId: -1,
                            userName: "PingBot",
                            userAvatar: "https://static.vecteezy.com/system/resources/previews/017/172/285/original/ai-play-games-gradient-glyph-icon-with-lineart-for-dark-theme-deep-reinforcement-learning-artificial-intelligence-bot-isolated-color-illustration-for-night-mode-solid-linear-pictogram-vector.jpg",
                            userScode: game.result.Player1.userScode,
                        }
                    }


                    if (Player1.userId != user_id) {
                        [Player1, Player2] = [Player2, Player1]
                    }

                    matchs.push({
                        id: game.id,
                        MatchId: game.MatchId,
                        Player1: (Player1),
                        Player2: (Player2),
                        Winner: game.Winner,
                        is_live: !game.matchOver
                    });
                }
            }
        }
        console.log("get_user_matches end");

        return (matchs.reverse());
    };

    async get_achievements(user_id: number) {
        const user = await this.UsersRepo.findOne({
            where: { user_id: user_id },
            relations: ['achievements']
        });

        if (user) {
            const achievements = user.achievements;
            const userAchievements: achieve[] = [];
            achievements.forEach((achievement) => {
                userAchievements.push({
                    img: achievement.image,
                    name: achievement.name,
                    time: achievement.time,
                    unlocked: true
                });
            });
            return userAchievements;
        }
        return [];
    }

    // async get_unseen_achievements(user_id: number) {
    //     const user = await this.UsersRepo.findOne({
    //         where: { user_id: user_id },
    //         relations: ['achievements']
    //     });

    //     if (user) {
    //         const achievements = user.achievements;
    //         const userAchievements: achieve[] = [];
    //         achievements.forEach((achievement) => {
    //             if (!achievement.seen) {
    //                 console.log("you have unseen achievements");
    //             }
    //         });
    //         return userAchievements;
    //     }
    //     return [];
    // }

    async get_user_progress(user_id: number): Promise<LevelInfo> {
        const userProfile = await this.ProfileRepo.findOne({
            where: { id: user_id },
            relations: ['Progress']
        });

        if (userProfile) {
            var all_achievements = [...ACHIEVEMENT_LIST];
            const achievements = await this.get_achievements(user_id);

            var userAchievements: achieve[] = [];

            achievements.forEach((achievement) => { userAchievements.push(achievement); });

            all_achievements.map((achievement) => {
                const found = userAchievements.find((userAchievement) => userAchievement.name === achievement.name);
                if (found) {
                    return found;
                } else {
                    userAchievements.push({
                        img: achievement.image,
                        name: achievement.name,
                        time: "",
                        unlocked: false
                    });
                }
            });

            const league = userProfile.Progress.league

            const levelInfo: LevelInfo = {
                league: `http://${process.env.HOST}:4040/view/league/${league}.png`,
                wins: userProfile.wins,
                loses: userProfile.loses,
                level: userProfile.Progress.level,
                precLevel: userProfile.Progress.nextLevelPercent,
                MainLevelColor: LEAGUES_COLORS.get(league).main_color,
                BgLevelColor: LEAGUES_COLORS.get(league).bg_color,
                achievement: userAchievements,
            };
            return levelInfo;
        }

        return null;
    }

    async get_user_statistics(user_id: number) {
        const user = await this.UsersRepo.findOne({
            where: { user_id },
            relations: ['profile', 'Statistics'],
        });

        if (user) {
            const statistics = user.Statistics;
            const userStatistics_time = [];
            const userStatistics_score_by_time = [];
            const userStatistics_matches = [];

            statistics.forEach((statistic) => {
                userStatistics_time.push(statistic.date);
                userStatistics_score_by_time.push(statistic.totalScore);
                userStatistics_matches.push(statistic.totalMatches);
            });

            return {
                time: userStatistics_time,
                score: userStatistics_score_by_time,
                matchs: userStatistics_matches,
            } as UserStatistic;
        }
        return {
            time: [],
            score: [],
            matchs: [],
        } as UserStatistic;
    }
}