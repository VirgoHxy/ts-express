import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1666747275089 implements MigrationInterface {
    name = 'migration1666747275089'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`record\` ADD \`name\` varchar(20) NOT NULL COMMENT '名称'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`record\` DROP COLUMN \`name\``);
    }

}
