import { loggerInstance } from '@plugins';
import { mysqlDataSource } from './mysql.datasource';

export async function initDataSource() {
  // 初始化数据库
  const logger = loggerInstance.getLogger('datasource');
  try {
    await mysqlDataSource.initialize();
    logger.info('DataSource has been initialized!');
    return;
  } catch (error) {
    logger.error(error);
  }
}
export * from './mysql.datasource';
