import { MigrationInterface, QueryRunner } from "typeorm";
export declare class Intramegration1712532912708 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
