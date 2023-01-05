import { plainToInstance } from 'class-transformer';
import { IsDate, IsInt, IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserDto } from '../dtos';

@Entity()
export class User {
  constructor(data: UserDto) {
    return plainToInstance(User, data);
  }

  @PrimaryGeneratedColumn()
  @IsInt()
  id: number;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '名称',
    nullable: false,
  })
  @IsString()
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '账号',
    nullable: false,
  })
  @IsString()
  account: string;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '密码',
    nullable: false,
  })
  @IsString()
  password: string;

  @CreateDateColumn({
    name: 'create_time',
    type: 'datetime',
    comment: '创建时间',
    nullable: false,
    precision: 0,
  })
  @IsDate()
  createTime: string;

  @UpdateDateColumn({
    name: 'update_time',
    type: 'datetime',
    comment: '更新时间',
    nullable: false,
    precision: 0,
  })
  @IsDate()
  updateTime: string;
}
