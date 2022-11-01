import { IsDate, IsEmpty, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Record {
  @PrimaryGeneratedColumn()
  @IsEmpty({ groups: ['update'] })
  @IsOptional({ groups: ['update', 'upsert'] }) // 在update和upsert 如果缺失这个值 就忽略其他验证
  @IsInt()
  id: number;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '名称',
    nullable: false,
  })
  @IsNotEmpty({ groups: ['create'] })
  @IsOptional({ groups: ['update', 'upsert'] })
  @IsString()
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '记录内容',
    nullable: false,
  })
  @IsNotEmpty({ groups: ['create'] })
  @IsOptional({ groups: ['update', 'upsert'] })
  @IsString()
  content: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '位置',
    nullable: true,
  })
  @IsOptional({ groups: ['update', 'upsert'] })
  @IsString()
  location?: string;

  @CreateDateColumn({
    name: 'create_time',
    type: 'datetime',
    comment: '创建时间',
    nullable: false,
    precision: 0,
  })
  @IsEmpty()
  @IsOptional()
  @IsDate()
  createTime: string;

  @UpdateDateColumn({
    name: 'update_time',
    type: 'datetime',
    comment: '更新时间',
    nullable: false,
    precision: 0,
  })
  @IsEmpty()
  @IsOptional()
  @IsDate()
  updateTime: string;
}
