import { IsString, ValidateIf } from 'class-validator';

// 一般可以直接在entity上定义，不需要单独创建dto
export class GetRecordsTestDto {
  @IsString()
  @ValidateIf((_object, value) => value != undefined || value != '') // 如果false 则忽略其他验证
  public content?: string;

  @IsString()
  @ValidateIf((_object, value) => value != undefined)
  public name?: string;
}
