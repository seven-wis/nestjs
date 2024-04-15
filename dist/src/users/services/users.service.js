"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const entities_1 = require("../entities");
const typeorm_1 = require("@nestjs/typeorm");
const repositories_1 = require("../../utils/repositories");
const playprogress_repository_1 = require("../../utils/repositories/playprogress.repository");
const entities_2 = require("../entities");
const achievment_service_1 = require("./achievment.service");
const achievement_constant_1 = require("../../utils/constant/achievement.constant");
const profileGateway_service_1 = require("../../websockets/profile-gateway/profileGateway.service");
let UsersService = class UsersService {
    constructor(UsersRepo, FriendsRepo, ProfileRepo, PlayProgressRepo, statisticRepository, profileGatewayService, acheivmentService) {
        this.UsersRepo = UsersRepo;
        this.FriendsRepo = FriendsRepo;
        this.ProfileRepo = ProfileRepo;
        this.PlayProgressRepo = PlayProgressRepo;
        this.statisticRepository = statisticRepository;
        this.profileGatewayService = profileGatewayService;
        this.acheivmentService = acheivmentService;
    }
    async get_user_by_email(Email) {
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
    async create_player_progress() {
        const playerProgress = new entities_1.PlayProgress();
        await this.PlayProgressRepo.save(playerProgress);
        return playerProgress;
    }
    async create_user_profile(user_data) {
        const userProfile = new entities_1.Profile();
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
    }
    ;
    async create_new_user(user_data) {
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
            throw new common_1.NotFoundException('Error while creating user profile');
        }
        const user = new entities_1.User();
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
    async user_data(user_id) {
        return await this.UsersRepo.findOne({
            where: { user_id },
            relations: ['profile'],
        });
    }
    async get_current_rooms(user_id) {
        return await this.UsersRepo.findOne({
            where: {
                user_id: user_id
            },
            relations: ['profile', 'rooms'],
        });
    }
    async update_bot_level(user_id, level) {
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
    async update_level(user_id) {
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
                }
                else {
                    const power = Math.floor(Math.log2(userProfile.Maxscore / 10));
                    PlayerProgress.level = power + 1;
                    const lvScore = Math.pow(2, power) * 10;
                    const RestScore = userProfile.Maxscore - lvScore;
                    PlayerProgress.nextLevelPercent = Math.floor((RestScore / lvScore) * 100);
                    if (achievement_constant_1.LEAGUES.has(PlayerProgress.level)) {
                        PlayerProgress.league = achievement_constant_1.LEAGUES.get(PlayerProgress.level);
                    }
                }
                if (achievement_constant_1.ACHIEVEMENT_LEVELS.includes(PlayerProgress.level) && current_level != PlayerProgress.level) {
                    for (let level = current_level; level <= PlayerProgress.level; level++) {
                        if (achievement_constant_1.ACHIEVEMENT_LEVELS.includes(level) && current_level != level) {
                            await this.acheivmentService.createAchievement(user_id, achievement_constant_1.ACHIEVEMENT_LEVELS.indexOf(level) + 1);
                        }
                    }
                }
                return await this.PlayProgressRepo.save(PlayerProgress);
            }
        }
        return null;
    }
    async add_new_score(user_id, score) {
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
        }
        return null;
    }
    async update_user_statistic(user_id, winner) {
        const user = await this.UsersRepo.findOne({
            where: { user_id },
            relations: ["profile"],
        });
        if (user) {
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
                }
                else {
                    statistic.totalLoses++;
                }
                return await this.statisticRepository.save(statistic);
            }
            else {
                const newStatistic = new entities_2.Statistics();
                newStatistic.date = date;
                newStatistic.Player = user;
                newStatistic.totalScore = user.profile.score;
                newStatistic.totalMatches++;
                if (winner) {
                    newStatistic.totalWins = 1;
                }
                else {
                    newStatistic.totalLoses = 1;
                }
                return await this.statisticRepository.save(newStatistic);
            }
        }
    }
    async get_user_score(user_id) {
        const userProfile = await this.ProfileRepo.findOne({
            where: { id: user_id },
        });
        if (userProfile) {
            return { user_id: user_id, score: userProfile.score };
        }
        return { user_id: -1, score: -1 };
    }
    async add_match(user_id, match) {
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
    async update_status(user_id, status) {
        const user = await this.UsersRepo.findOne({
            where: { user_id },
            relations: ['profile'],
        });
        const userProfile = await this.ProfileRepo.findOne({
            where: { id: user_id }
        });
        if (!user) {
            return false;
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
            const leaderboard = [];
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
    async get_user_matches(user_id) {
        const user = await this.UsersRepo.findOne({
            where: { user_id },
            relations: ['profile', 'matches', 'matches.Player', 'matches.Player.profile'],
        });
        console.log("get_user_matches start");
        var matchs = [];
        if (user) {
            const all = user.matches;
            if (all) {
                for (const game of all) {
                    var Player1, Player2;
                    Player1 = {
                        userId: game.Player[0].user_id,
                        userName: game.Player[0].user_name,
                        userAvatar: game.Player[0].profile.user_avatar,
                        userScode: game.result.Player1.userId == game.Player[0].user_id ? game.result.Player1.userScode : game.result.Player2.userScode,
                    };
                    if (game.Player1 != -1) {
                        Player2 = {
                            userId: game.Player[1].user_id,
                            userName: game.Player[1].user_name,
                            userAvatar: game.Player[1].profile.user_avatar,
                            userScode: game.result.Player2.userId == game.Player[1].user_id ? game.result.Player2.userScode : game.result.Player1.userScode,
                        };
                    }
                    else {
                        Player2 = {
                            userId: -1,
                            userName: "PingBot",
                            userAvatar: "https://static.vecteezy.com/system/resources/previews/017/172/285/original/ai-play-games-gradient-glyph-icon-with-lineart-for-dark-theme-deep-reinforcement-learning-artificial-intelligence-bot-isolated-color-illustration-for-night-mode-solid-linear-pictogram-vector.jpg",
                            userScode: game.result.Player1.userScode,
                        };
                    }
                    if (Player1.userId != user_id) {
                        [Player1, Player2] = [Player2, Player1];
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
    }
    ;
    async get_achievements(user_id) {
        const user = await this.UsersRepo.findOne({
            where: { user_id: user_id },
            relations: ['achievements']
        });
        if (user) {
            const achievements = user.achievements;
            const userAchievements = [];
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
    async get_user_progress(user_id) {
        const userProfile = await this.ProfileRepo.findOne({
            where: { id: user_id },
            relations: ['Progress']
        });
        if (userProfile) {
            var all_achievements = [...achievement_constant_1.ACHIEVEMENT_LIST];
            const achievements = await this.get_achievements(user_id);
            var userAchievements = [];
            achievements.forEach((achievement) => { userAchievements.push(achievement); });
            all_achievements.map((achievement) => {
                const found = userAchievements.find((userAchievement) => userAchievement.name === achievement.name);
                if (found) {
                    return found;
                }
                else {
                    userAchievements.push({
                        img: achievement.image,
                        name: achievement.name,
                        time: "",
                        unlocked: false
                    });
                }
            });
            const league = userProfile.Progress.league;
            const levelInfo = {
                league: `http://${process.env.HOST}:4040/view/league/${league}.png`,
                wins: userProfile.wins,
                loses: userProfile.loses,
                level: userProfile.Progress.level,
                precLevel: userProfile.Progress.nextLevelPercent,
                MainLevelColor: achievement_constant_1.LEAGUES_COLORS.get(league).main_color,
                BgLevelColor: achievement_constant_1.LEAGUES_COLORS.get(league).bg_color,
                achievement: userAchievements,
            };
            return levelInfo;
        }
        return null;
    }
    async get_user_statistics(user_id) {
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
            };
        }
        return {
            time: [],
            score: [],
            matchs: [],
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Friendship)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Profile)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.PlayProgress)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_2.Statistics)),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => profileGateway_service_1.ProfileGatewayService))),
    __metadata("design:paramtypes", [repositories_1.UsersRepository,
        repositories_1.FriendShipRepository,
        repositories_1.ProfileRepository,
        playprogress_repository_1.PlayProgressRepository,
        repositories_1.StatisticRepository,
        profileGateway_service_1.ProfileGatewayService,
        achievment_service_1.AchievementsService])
], UsersService);
//# sourceMappingURL=users.service.js.map