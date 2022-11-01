import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1666685792437 implements MigrationInterface {
    name = 'migration1666685792437'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`record\` (\`id\` int NOT NULL AUTO_INCREMENT, \`content\` varchar(100) NOT NULL COMMENT '记录内容', \`create_time\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`update_time\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`record\``);
    }

}
