import { IsEmpty, IsInt, IsNotEmpty, IsOptional, IsString, NotEquals } from 'class-validator';

export class UserDto {
  @IsEmpty({ groups: ['create', 'update'] })
  @NotEquals('', { groups: ['create', 'update'] })
  @IsOptional({ groups: ['upsert', 'find'] }) // 在upsert,find生效 如果缺失这个值 就忽略其他验证
  @IsInt()
  id: number;

  @IsNotEmpty({ groups: ['create'] })
  @IsOptional({ groups: ['update', 'upsert', 'find'] })
  @IsString()
  name: string;

  @IsNotEmpty({ groups: ['create'] })
  @IsOptional({ groups: ['update', 'upsert', 'find'] })
  @IsString()
  account: string;

  @IsNotEmpty({ groups: ['create'] })
  @IsEmpty({ groups: ['update', 'upsert', 'find'] })
  @IsString()
  password: string;
}
