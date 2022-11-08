import { IsString, ValidateIf } from 'class-validator';

export class GetRecordsTestDto {
  @IsString()
  @ValidateIf((_object, value) => value != undefined || value != '') // 如果false 则忽略其他验证
  public content?: string;

  @IsString()
  @ValidateIf((_object, value) => value != undefined)
  public name?: string;
}
