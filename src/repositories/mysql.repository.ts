import { mysqlDataSource } from 'datasources';
import { CustomRepository } from 'repositories';
import { Service } from 'typedi';
import { EntityTarget } from 'typeorm';
import { Record, User } from '../entities';

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

@Service()
export class UserRepository extends MysqlCustomRepository<User> {
  constructor() {
    super(User);
  }
}
