import { HttpException } from '@others';
import { mysqlDataSource } from 'datasources';
import { Service } from 'typedi';
import { DataSource, EntityManager, EntityTarget, FindOptionsWhere, QueryRunner, Repository } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { Record } from '../entities';

class CustomEntityManager<T> extends EntityManager {
  constructor(private entityClass: EntityTarget<T>, dataSource: DataSource, queryRunner?: QueryRunner) {
    super(dataSource, queryRunner);
  }

  async existOne(opt: string | number | FindOptionsWhere<T>): Promise<boolean> {
    let option: FindOptionsWhere<T>;
    if (typeof opt === 'string' || typeof opt === 'number') {
      option = {
        id: opt,
      } as unknown as FindOptionsWhere<T>;
    } else {
      option = opt;
    }
    const number = await this.countBy(this.entityClass, option);
    return number !== 0;
  }

  async existOneOrFail(opt: string | number | FindOptionsWhere<T>): Promise<boolean> {
    let option: FindOptionsWhere<T>;
    if (typeof opt === 'string' || typeof opt === 'number') {
      option = {
        id: opt,
      } as unknown as FindOptionsWhere<T>;
    } else {
      option = opt;
    }
    const number = await this.countBy(this.entityClass, option);
    if (number === 0) {
      throw new HttpException(404, 'could not find any entity');
    }
    return true;
  }
}

class CustomRepository<T> extends Repository<T> {
  transactionQueryRunner: QueryRunner;
  transactionManager: CustomEntityManager<T>;
  manager: CustomEntityManager<T>;

  constructor(private entityClass: EntityTarget<T>, private dataSource: DataSource) {
    super(entityClass, new CustomEntityManager(entityClass, dataSource));
  }

  private async setQueryRunner() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    this.transactionQueryRunner = queryRunner;
    this.transactionManager = new CustomEntityManager(this.entityClass, this.dataSource, queryRunner);
  }

  async transaction(cb: (entityManager: CustomEntityManager<T>) => Promise<unknown>): Promise<void>;
  async transaction(
    isolationLevel: IsolationLevel,
    cb: (entityManager: CustomEntityManager<T>) => Promise<unknown>,
  ): Promise<void>;
  async transaction(
    arg0: IsolationLevel | ((entityManager: CustomEntityManager<T>) => Promise<unknown>),
    arg1?: (entityManager: CustomEntityManager<T>) => Promise<unknown>,
  ): Promise<void> {
    let cb: (entityManager: CustomEntityManager<T>) => Promise<unknown>, isolationLevel: IsolationLevel;
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
    const queryRunner = this.transactionQueryRunner;
    const manager = this.transactionManager;
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

  async existOne(opt: string | number | FindOptionsWhere<T>): Promise<boolean> {
    return this.manager.existOne(opt);
  }

  async existOneOrFail(opt: string | number | FindOptionsWhere<T>): Promise<boolean> {
    return this.manager.existOneOrFail(opt);
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
