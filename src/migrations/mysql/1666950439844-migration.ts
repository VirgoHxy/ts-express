import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1666950439844 implements MigrationInterface {
    name = 'migration1666950439844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`record\` DROP COLUMN \`location\``);
        await queryRunner.query(`ALTER TABLE \`record\` ADD \`location\` varchar(50) NULL COMMENT '位置'`);
        await queryRunner.query(`ALTER TABLE \`record\` CHANGE \`create_time\` \`create_time\` datetime(0) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`record\` CHANGE \`update_time\` \`update_time\` datetime(0) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`record\` CHANGE \`update_time\` \`update_time\` datetime(0) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`record\` CHANGE \`create_time\` \`create_time\` datetime(0) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`record\` DROP COLUMN \`location\``);
        await queryRunner.query(`ALTER TABLE \`record\` ADD \`location\` varchar(100) NOT NULL COMMENT '记录内容'`);
    }

}
