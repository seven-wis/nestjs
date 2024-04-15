import { MigrationInterface, QueryRunner } from "typeorm";

export class Intramegration1712532912708 implements MigrationInterface {
    name = 'Intramegration1712532912708'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "play_progress" ("id" SERIAL NOT NULL, "level" integer NOT NULL DEFAULT '0', "nextLevelPercent" integer NOT NULL DEFAULT '0', "league" character varying NOT NULL DEFAULT 'wood', "profileId" integer, CONSTRAINT "REL_5125b93a7c3ed6bd93242ad8a7" UNIQUE ("profileId"), CONSTRAINT "PK_6a032ae64ebbec4bc10068983c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "profile" ("id" SERIAL NOT NULL, "user_email" character varying NOT NULL, "user_avatar" character varying NOT NULL, "user_firstName" character varying NOT NULL, "user_lastName" character varying NOT NULL, "user_Status" integer NOT NULL, "wins" integer NOT NULL DEFAULT '0', "loses" integer NOT NULL DEFAULT '0', "score" integer NOT NULL DEFAULT '0', "Maxscore" integer NOT NULL DEFAULT '0', "level" integer NOT NULL DEFAULT '0', "nextLevelPercent" integer NOT NULL DEFAULT '0', "firstlogin" boolean NOT NULL DEFAULT true, "twoFactAuth" boolean NOT NULL DEFAULT false, "twoFactSecret" character varying, "BotLevel" double precision NOT NULL DEFAULT '0.25', "userUserId" bigint, "progressId" integer, CONSTRAINT "UQ_2ce50a68cdeed7da2d78164349c" UNIQUE ("user_email"), CONSTRAINT "REL_c645941c0a12a9e9934026e018" UNIQUE ("userUserId"), CONSTRAINT "REL_51dc0ff2396f15da5add8bd101" UNIQUE ("progressId"), CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "statistics" ("id" SERIAL NOT NULL, "date" character varying NOT NULL, "totalScore" integer NOT NULL DEFAULT '0', "totalMatches" integer NOT NULL DEFAULT '0', "totalWins" integer NOT NULL DEFAULT '0', "totalLoses" integer NOT NULL DEFAULT '0', "playerUserId" bigint, CONSTRAINT "PK_c3769cca342381fa827a0f246a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "private_chat" ("message_id" SERIAL NOT NULL, "content" character varying NOT NULL, "timestamp" TIMESTAMP NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "senderUserId" bigint, "receiverUserId" bigint, "friendshipId" integer, CONSTRAINT "PK_7c02aaaa56b969bca7354be329e" PRIMARY KEY ("message_id"))`);
        await queryRunner.query(`CREATE TABLE "friendship" ("id" SERIAL NOT NULL, "friendshiptoekn" character varying NOT NULL DEFAULT '0b6d76d8-1564-4d55-9952-889f0b6f84af', "status" character varying NOT NULL DEFAULT 'pending', "senderId" bigint, "receiverId" bigint, "friendId" bigint, "blockedById" bigint, CONSTRAINT "PK_dbd6fb568cd912c5140307075cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mute" ("id" SERIAL NOT NULL, "mute_user_id" integer NOT NULL, "mute_room_id" integer NOT NULL, "mute_time" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_35784f3fa6b4281e0fb16d6d7fc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."rooms_users_ref_role_enum" AS ENUM('owner', 'admin', 'member')`);
        await queryRunner.query(`CREATE TYPE "public"."rooms_users_ref_status_enum" AS ENUM('active', 'invited', 'banned', 'muted')`);
        await queryRunner.query(`CREATE TABLE "rooms_users_ref" ("id" SERIAL NOT NULL, "role" "public"."rooms_users_ref_role_enum" NOT NULL DEFAULT 'member', "status" "public"."rooms_users_ref_status_enum" NOT NULL DEFAULT 'active', "ref_token" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "number_of_unread_messages" integer NOT NULL DEFAULT '0', "userUserId" bigint, "roomRoomId" bigint, "muteId" integer, CONSTRAINT "REL_dfbaf7c2a76d5659752e8fcb82" UNIQUE ("muteId"), CONSTRAINT "PK_eae00aa20f3e8609cc12936763f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "room_message" ("id" SERIAL NOT NULL, "message" character varying NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "senderUserId" bigint, "roomRoomId" bigint, CONSTRAINT "PK_4d4598ed140cbdaf3e9879aca1a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."room_room_type_enum" AS ENUM('public', 'private', 'protected')`);
        await queryRunner.query(`CREATE TABLE "room" ("room_id" BIGSERIAL NOT NULL, "room_name" character varying NOT NULL, "room_type" "public"."room_room_type_enum" NOT NULL DEFAULT 'public', "room_password" character varying, "ownerUserId" bigint, CONSTRAINT "PK_483751c0abab68ed1ac952ae920" PRIMARY KEY ("room_id"))`);
        await queryRunner.query(`CREATE TABLE "game_history" ("id" SERIAL NOT NULL, "MatchId" character varying NOT NULL, "gameType" character varying NOT NULL, "Player1" integer, "Player2" integer, "result" jsonb NOT NULL DEFAULT '{"Player1":{"userId":0,"userScore":0},"Player2":{"userId":0,"userScore":0}}', "matchRender" jsonb, "Winner" integer, "matchOver" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_0e74b90c56b815ed54e90a29f1a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("user_id" BIGSERIAL NOT NULL, "user_name" character varying NOT NULL, "profileId" integer, CONSTRAINT "UQ_d34106f8ec1ebaf66f4f8609dd6" UNIQUE ("user_name"), CONSTRAINT "REL_9466682df91534dd95e4dbaa61" UNIQUE ("profileId"), CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "achievements" ("id" SERIAL NOT NULL, "achievement_id" integer NOT NULL, "name" character varying NOT NULL, "image" character varying NOT NULL, "time" character varying NOT NULL, "seen" boolean NOT NULL DEFAULT false, "count" integer NOT NULL DEFAULT '12', "playerUserId" bigint, CONSTRAINT "PK_1bc19c37c6249f70186f318d71d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "game_betting" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "gameId" integer NOT NULL, "bettingValue" integer NOT NULL, "betOn" integer NOT NULL, "status" character varying NOT NULL, CONSTRAINT "PK_a701fb1d99185e077c14d926810" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_notif_type_enum" AS ENUM('friendReq', 'roomInvit', 'roomAction')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "notif_user_id" integer NOT NULL, "notif_avatar" character varying NOT NULL, "notif_type" "public"."notifications_notif_type_enum" NOT NULL, "notif_title" character varying NOT NULL, "notif_description" character varying NOT NULL, "notif_status" character varying NOT NULL, "notif_target" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_rooms_room" ("userUserId" bigint NOT NULL, "roomRoomId" bigint NOT NULL, CONSTRAINT "PK_e4075dc4f77ee293c651820b932" PRIMARY KEY ("userUserId", "roomRoomId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1445fc0bc955cfa85179463f6d" ON "user_rooms_room" ("userUserId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d0c17b1facb88320bc954c47ee" ON "user_rooms_room" ("roomRoomId") `);
        await queryRunner.query(`CREATE TABLE "user_matches_game_history" ("userUserId" bigint NOT NULL, "gameHistoryId" integer NOT NULL, CONSTRAINT "PK_464e760ad2cdbe64a01949d2322" PRIMARY KEY ("userUserId", "gameHistoryId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f07f2c7daa4b1914433d1f98bd" ON "user_matches_game_history" ("userUserId") `);
        await queryRunner.query(`CREATE INDEX "IDX_806e5be77a7e2fd4d595546896" ON "user_matches_game_history" ("gameHistoryId") `);
        await queryRunner.query(`ALTER TABLE "play_progress" ADD CONSTRAINT "FK_5125b93a7c3ed6bd93242ad8a72" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profile" ADD CONSTRAINT "FK_c645941c0a12a9e9934026e0189" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profile" ADD CONSTRAINT "FK_51dc0ff2396f15da5add8bd1015" FOREIGN KEY ("progressId") REFERENCES "play_progress"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "statistics" ADD CONSTRAINT "FK_9bcd85875d7c4d25b5362dec026" FOREIGN KEY ("playerUserId") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "private_chat" ADD CONSTRAINT "FK_5dc9260b1ece983ccdb9b80c20a" FOREIGN KEY ("senderUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "private_chat" ADD CONSTRAINT "FK_d332f101cd42637bcdd3f35c931" FOREIGN KEY ("receiverUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "private_chat" ADD CONSTRAINT "FK_fa73eb0e4d4f0b23c6c2aa92481" FOREIGN KEY ("friendshipId") REFERENCES "friendship"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friendship" ADD CONSTRAINT "FK_e8a1f15f614d577cded58c58ee0" FOREIGN KEY ("senderId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friendship" ADD CONSTRAINT "FK_1ce7870ad7e93284a3f186811f1" FOREIGN KEY ("receiverId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friendship" ADD CONSTRAINT "FK_9372d39ed9833c770cb6d2c5cd1" FOREIGN KEY ("friendId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friendship" ADD CONSTRAINT "FK_48e6eaec06f9c3ba8a1a1024272" FOREIGN KEY ("blockedById") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rooms_users_ref" ADD CONSTRAINT "FK_f06da294cd1a54797496cf68f12" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rooms_users_ref" ADD CONSTRAINT "FK_ed1d5cce93bf1ab2f0468ff56cb" FOREIGN KEY ("roomRoomId") REFERENCES "room"("room_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rooms_users_ref" ADD CONSTRAINT "FK_dfbaf7c2a76d5659752e8fcb824" FOREIGN KEY ("muteId") REFERENCES "mute"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_message" ADD CONSTRAINT "FK_03a59990a5ce09e637d06ea7ef6" FOREIGN KEY ("senderUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_message" ADD CONSTRAINT "FK_f6faa769b84ee9b651f84f46384" FOREIGN KEY ("roomRoomId") REFERENCES "room"("room_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room" ADD CONSTRAINT "FK_60e2d81f010c36c3ccc8b975da0" FOREIGN KEY ("ownerUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_9466682df91534dd95e4dbaa616" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "achievements" ADD CONSTRAINT "FK_f909d9b4fa57afa8ed7252c91a1" FOREIGN KEY ("playerUserId") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_rooms_room" ADD CONSTRAINT "FK_1445fc0bc955cfa85179463f6db" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_rooms_room" ADD CONSTRAINT "FK_d0c17b1facb88320bc954c47eeb" FOREIGN KEY ("roomRoomId") REFERENCES "room"("room_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_matches_game_history" ADD CONSTRAINT "FK_f07f2c7daa4b1914433d1f98bd9" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_matches_game_history" ADD CONSTRAINT "FK_806e5be77a7e2fd4d5955468965" FOREIGN KEY ("gameHistoryId") REFERENCES "game_history"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_matches_game_history" DROP CONSTRAINT "FK_806e5be77a7e2fd4d5955468965"`);
        await queryRunner.query(`ALTER TABLE "user_matches_game_history" DROP CONSTRAINT "FK_f07f2c7daa4b1914433d1f98bd9"`);
        await queryRunner.query(`ALTER TABLE "user_rooms_room" DROP CONSTRAINT "FK_d0c17b1facb88320bc954c47eeb"`);
        await queryRunner.query(`ALTER TABLE "user_rooms_room" DROP CONSTRAINT "FK_1445fc0bc955cfa85179463f6db"`);
        await queryRunner.query(`ALTER TABLE "achievements" DROP CONSTRAINT "FK_f909d9b4fa57afa8ed7252c91a1"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_9466682df91534dd95e4dbaa616"`);
        await queryRunner.query(`ALTER TABLE "room" DROP CONSTRAINT "FK_60e2d81f010c36c3ccc8b975da0"`);
        await queryRunner.query(`ALTER TABLE "room_message" DROP CONSTRAINT "FK_f6faa769b84ee9b651f84f46384"`);
        await queryRunner.query(`ALTER TABLE "room_message" DROP CONSTRAINT "FK_03a59990a5ce09e637d06ea7ef6"`);
        await queryRunner.query(`ALTER TABLE "rooms_users_ref" DROP CONSTRAINT "FK_dfbaf7c2a76d5659752e8fcb824"`);
        await queryRunner.query(`ALTER TABLE "rooms_users_ref" DROP CONSTRAINT "FK_ed1d5cce93bf1ab2f0468ff56cb"`);
        await queryRunner.query(`ALTER TABLE "rooms_users_ref" DROP CONSTRAINT "FK_f06da294cd1a54797496cf68f12"`);
        await queryRunner.query(`ALTER TABLE "friendship" DROP CONSTRAINT "FK_48e6eaec06f9c3ba8a1a1024272"`);
        await queryRunner.query(`ALTER TABLE "friendship" DROP CONSTRAINT "FK_9372d39ed9833c770cb6d2c5cd1"`);
        await queryRunner.query(`ALTER TABLE "friendship" DROP CONSTRAINT "FK_1ce7870ad7e93284a3f186811f1"`);
        await queryRunner.query(`ALTER TABLE "friendship" DROP CONSTRAINT "FK_e8a1f15f614d577cded58c58ee0"`);
        await queryRunner.query(`ALTER TABLE "private_chat" DROP CONSTRAINT "FK_fa73eb0e4d4f0b23c6c2aa92481"`);
        await queryRunner.query(`ALTER TABLE "private_chat" DROP CONSTRAINT "FK_d332f101cd42637bcdd3f35c931"`);
        await queryRunner.query(`ALTER TABLE "private_chat" DROP CONSTRAINT "FK_5dc9260b1ece983ccdb9b80c20a"`);
        await queryRunner.query(`ALTER TABLE "statistics" DROP CONSTRAINT "FK_9bcd85875d7c4d25b5362dec026"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP CONSTRAINT "FK_51dc0ff2396f15da5add8bd1015"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP CONSTRAINT "FK_c645941c0a12a9e9934026e0189"`);
        await queryRunner.query(`ALTER TABLE "play_progress" DROP CONSTRAINT "FK_5125b93a7c3ed6bd93242ad8a72"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_806e5be77a7e2fd4d595546896"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f07f2c7daa4b1914433d1f98bd"`);
        await queryRunner.query(`DROP TABLE "user_matches_game_history"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d0c17b1facb88320bc954c47ee"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1445fc0bc955cfa85179463f6d"`);
        await queryRunner.query(`DROP TABLE "user_rooms_room"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_notif_type_enum"`);
        await queryRunner.query(`DROP TABLE "game_betting"`);
        await queryRunner.query(`DROP TABLE "achievements"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "game_history"`);
        await queryRunner.query(`DROP TABLE "room"`);
        await queryRunner.query(`DROP TYPE "public"."room_room_type_enum"`);
        await queryRunner.query(`DROP TABLE "room_message"`);
        await queryRunner.query(`DROP TABLE "rooms_users_ref"`);
        await queryRunner.query(`DROP TYPE "public"."rooms_users_ref_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."rooms_users_ref_role_enum"`);
        await queryRunner.query(`DROP TABLE "mute"`);
        await queryRunner.query(`DROP TABLE "friendship"`);
        await queryRunner.query(`DROP TABLE "private_chat"`);
        await queryRunner.query(`DROP TABLE "statistics"`);
        await queryRunner.query(`DROP TABLE "profile"`);
        await queryRunner.query(`DROP TABLE "play_progress"`);
    }

}
