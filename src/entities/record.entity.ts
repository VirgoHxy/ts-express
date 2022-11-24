import { plainToInstance } from 'class-transformer';
import { IsDate, IsInt, IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RecordDto } from '../dtos';

@Entity()
export class Record {
  constructor(data: RecordDto) {
    return plainToInstance(Record, data);
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
    length: 100,
    comment: '记录内容',
    nullable: false,
  })
  @IsString()
  content: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '位置',
    nullable: true,
  })
  @IsString()
  location?: string;

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
