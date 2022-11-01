import { mysqlDataSource } from 'datasources';
import { Service } from 'typedi';
import { DataSource, EntityManager, EntityTarget, QueryRunner, Repository } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { Record } from '../entities';

class CustomRepository<T> extends Repository<T> {
  queryRunner: QueryRunner;
  manager: EntityManager;

  constructor(private entityClass: EntityTarget<T>, private dataSource: DataSource) {
    super(entityClass, dataSource.createEntityManager());
  }

  private async setQueryRunner() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    this.queryRunner = queryRunner;
    this.manager = queryRunner.manager;
  }

  async transaction(arg0: (entityManager: EntityManager) => Promise<unknown>): Promise<void>;
  async transaction(arg0: IsolationLevel, arg1: (entityManager: EntityManager) => Promise<unknown>): Promise<void>;
  async transaction(
    arg0: IsolationLevel | ((entityManager: EntityManager) => Promise<unknown>),
    arg1?: (entityManager: EntityManager) => Promise<unknown>,
  ): Promise<void> {
    let cb: (entityManager: EntityManager) => Promise<unknown>, isolationLevel: IsolationLevel;
    if (typeof arg0 === 'string') {
      isolationLevel = arg0;
    } else if (typeof arg0 === 'function') {
      isolationLevel = 'READ COMMITTED';
      cb = arg0;
    } else {
      throw new Error('arguments is wrong');
    }
    if (typeof arg1 === 'function') {
      cb = arg1;
    } else if (typeof arg1 === 'undefined') {
    } else {
      throw new Error('arguments is wrong');
    }
    await this.setQueryRunner();
    const queryRunner = this.queryRunner;
    const manager = this.manager;
    await queryRunner.startTransaction(isolationLevel);
    try {
      await cb(manager);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

class MysqlCustomRepository<T> extends CustomRepository<T> {
  constructor(entityClass: EntityTarget<T>) {
    super(entityClass, mysqlDataSource);
  }
}

@Service()
export class RecordRepository extends MysqlCustomRepository<Record> {
  constructor() {
    super(Record);
  }
}
