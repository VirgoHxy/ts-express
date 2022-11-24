import { IsEmpty, IsInt, IsNotEmpty, IsOptional, IsString, NotEquals, ValidateIf } from 'class-validator';

export class RecordDto {
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
  content: string;

  @IsOptional({ always: true })
  @IsString()
  location?: string;
}

export class GetRecordsTestDto {
  @ValidateIf((_object, value) => value != undefined || value != '') // 自定义验证，如果条件false 则忽略其他验证，该效果和@IsOptional一样
  @IsString()
  public content?: string;

  @IsOptional()
  @IsString()
  public name?: string;
}
