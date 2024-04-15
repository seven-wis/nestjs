"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACHIEVEMENT_LIST = exports.ACHIEVEMENTS_NAMES = exports.LEAGUES_COLORS = exports.LEAGUES = exports.ACHIEVEMENT_LEVELS = void 0;
exports.ACHIEVEMENT_LEVELS = [1, 3, 5, 7, 9, 11, 13, 14, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 35];
exports.LEAGUES = new Map([
    [5, "bronze"],
    [11, "silver"],
    [19, "gold"],
    [23, "legend"],
]);
exports.LEAGUES_COLORS = new Map([
    ["wood", { main_color: "#E2BFB3", bg_color: "#F7DED096" }],
    ["bronze", { main_color: "#8B93FF", bg_color: "#7AA2E396" }],
    ["silver", { main_color: "#FAA300", bg_color: "#62D2A296" }],
    ["gold", { main_color: "#5755FE", bg_color: "#387ADF96" }],
    ["legend", { main_color: "#D24545", bg_color: "#FB6D4860" }],
]);
exports.ACHIEVEMENTS_NAMES = new Map([
    [0, 'Welcome'],
    [1, 'Initiate'],
    [2, 'Neophyte'],
    [3, 'Apprentice'],
    [4, 'Acolyte'],
    [5, 'Journeyman'],
    [6, 'Adept'],
    [7, 'Disciple'],
    [8, 'Evoker'],
    [9, 'Enchanter'],
    [10, 'Conjurer'],
    [11, 'Sage'],
    [12, 'Warlock'],
    [13, 'High Warden'],
    [14, 'Archmage'],
    [15, 'Grand Magus'],
    [16, 'Oracle'],
    [17, 'Thaumaturge'],
    [18, 'Archon'],
    [19, 'Luminary'],
    [20, 'Transcendent'],
]);
exports.ACHIEVEMENT_LIST = [
    {
        id: 0,
        name: exports.ACHIEVEMENTS_NAMES.get(0),
        image: `http://${process.env.HOST}:4040/view/achievement/0.png`,
        Level_id: 0,
    },
    {
        id: 1,
        name: exports.ACHIEVEMENTS_NAMES.get(1),
        image: `http://${process.env.HOST}:4040/view/achievement/1.png`,
        Level_id: 1,
    },
    {
        id: 2,
        name: exports.ACHIEVEMENTS_NAMES.get(2),
        image: `http://${process.env.HOST}:4040/view/achievement/2.png`,
        Level_id: 3,
    },
    {
        id: 3,
        name: exports.ACHIEVEMENTS_NAMES.get(3),
        image: `http://${process.env.HOST}:4040/view/achievement/3.png`,
        Level_id: 5,
    },
    {
        id: 5,
        name: exports.ACHIEVEMENTS_NAMES.get(5),
        image: `http://${process.env.HOST}:4040/view/achievement/5.png`,
        Level_id: 9,
    },
    {
        id: 6,
        name: exports.ACHIEVEMENTS_NAMES.get(6),
        image: `http://${process.env.HOST}:4040/view/achievement/6.png`,
        Level_id: 11,
    },
    {
        id: 7,
        name: exports.ACHIEVEMENTS_NAMES.get(7),
        image: `http://${process.env.HOST}:4040/view/achievement/7.png`,
        Level_id: 13,
    },
    {
        id: 8,
        name: exports.ACHIEVEMENTS_NAMES.get(8),
        image: `http://${process.env.HOST}:4040/view/achievement/8.png`,
        Level_id: 14,
    },
    {
        id: 9,
        name: exports.ACHIEVEMENTS_NAMES.get(9),
        image: `http://${process.env.HOST}:4040/view/achievement/9.png`,
        Level_id: 17,
    },
    {
        id: 10,
        name: exports.ACHIEVEMENTS_NAMES.get(10),
        image: `http://${process.env.HOST}:4040/view/achievement/10.png`,
        Level_id: 18,
    },
    {
        id: 11,
        name: exports.ACHIEVEMENTS_NAMES.get(11),
        image: `http://${process.env.HOST}:4040/view/achievement/11.png`,
        Level_id: 19,
    },
    {
        id: 12,
        name: exports.ACHIEVEMENTS_NAMES.get(12),
        image: `http://${process.env.HOST}:4040/view/achievement/12.png`,
        Level_id: 20,
    },
    {
        id: 13,
        name: exports.ACHIEVEMENTS_NAMES.get(13),
        image: `http://${process.env.HOST}:4040/view/achievement/13.png`,
        Level_id: 21,
    },
    {
        id: 14,
        name: exports.ACHIEVEMENTS_NAMES.get(14),
        image: `http://${process.env.HOST}:4040/view/achievement/14.png`,
        Level_id: 22,
    },
    {
        id: 15,
        name: exports.ACHIEVEMENTS_NAMES.get(15),
        image: `http://${process.env.HOST}:4040/view/achievement/15.png`,
        Level_id: 23,
    },
    {
        id: 16,
        name: exports.ACHIEVEMENTS_NAMES.get(16),
        image: `http://${process.env.HOST}:4040/view/achievement/16.png`,
        Level_id: 24,
    },
    {
        id: 17,
        name: exports.ACHIEVEMENTS_NAMES.get(17),
        image: `http://${process.env.HOST}:4040/view/achievement/17.png`,
        Level_id: 25,
    },
    {
        id: 18,
        name: exports.ACHIEVEMENTS_NAMES.get(18),
        image: `http://${process.env.HOST}:4040/view/achievement/18.png`,
        Level_id: 26,
    },
    {
        id: 19,
        name: exports.ACHIEVEMENTS_NAMES.get(19),
        image: `http://${process.env.HOST}:4040/view/achievement/19.png`,
        Level_id: 27,
    },
    {
        id: 20,
        name: exports.ACHIEVEMENTS_NAMES.get(20),
        image: `http://${process.env.HOST}:4040/view/achievement/20.png`,
        Level_id: 35,
    },
];
//# sourceMappingURL=achievement.constant.js.map