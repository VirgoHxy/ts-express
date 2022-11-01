import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { appConfig, dbConfig } from '../config';

const mysqlOptions: DataSourceOptions = {
  type: 'mysql',
  host: dbConfig.mysql.host,
  port: dbConfig.mysql.port,
  username: dbConfig.mysql.username,
  password: dbConfig.mysql.password,
  database: dbConfig.mysql.database,
  // 启动项目是否自动生成数据库架构
  synchronize: false,
  // 是否启动日志 sql语句打印
  logging: appConfig.debug,
  // 启动项目是否自动运行迁移
  migrationsRun: false,
  entities: [join(__dirname, '..', 'entities/**/*.{ts,js}')],
  migrations: [join(__dirname, '..', 'migrations/**/*.{ts,js}')],
};

export const mysqlDataSource = new DataSource(mysqlOptions);
