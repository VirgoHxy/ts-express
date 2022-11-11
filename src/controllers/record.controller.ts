import {
  Body,
  Delete,
  Get,
  HttpCode,
  JsonController,
  Param,
  Patch,
  Post,
  QueryParam,
  QueryParams,
  UseBefore,
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Service } from 'typedi';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';
import { GetRecordsTestDto } from '../dtos';
import { Record } from '../entities';
import { authMiddleware, resultMiddleware, validationMiddleware } from '../middlewares';
import { RecordRepository } from '../repositories';
import { RecordService } from '../services';

@JsonController('records')
@UseBefore(authMiddleware, resultMiddleware)
export class RecordController {
  constructor(@Service() private recordService: RecordService, @Service() private recordRepository: RecordRepository) {}

  @OpenAPI({ summary: 'Return a list of records by opt' })
  @ResponseSchema(Record, {
    isArray: true,
  })
  @Get('/')
  async find(@QueryParam('opt') opt?: FindManyOptions<Record>): Promise<{ count: number; results: Record[] }> {
    const count = await this.recordRepository.count(opt);
    const results = await this.recordRepository.find(opt);
    return {
      count,
      results,
    };
  }

  @OpenAPI({ summary: 'Return a count of records by opt' })
  @ResponseSchema(Number)
  @Get('/count')
  async count(@QueryParam('opt') opt?: FindOptionsWhere<Record>): Promise<number> {
    const count = await this.recordRepository.countBy(opt);
    return count;
  }

  @OpenAPI({ summary: 'Return a record by id' })
  @ResponseSchema(Record)
  @Get('/:id')
  async findById(@Param('id') id: number, @QueryParam('opt') opt?: FindOptionsWhere<Record>): Promise<Record> {
    await this.recordRepository.existOneOrFail({ id });
    const result = await this.recordRepository.findOne(Object.assign({ where: { id } }, opt));
    return result;
  }

  @OpenAPI({ summary: 'Update a record by id' })
  @HttpCode(204)
  @UseBefore(validationMiddleware(Record, 'body', ['update']))
  @Patch('/:id')
  async updateById(@Param('id') id: number, @Body() body: Record): Promise<null> {
    await this.recordRepository.existOneOrFail(id);
    await this.recordRepository.update(id, body);
    return null;
  }

  @OpenAPI({ summary: 'Delete a record by id' })
  @HttpCode(204)
  @Delete('/:id')
  async deleteById(@Param('id') id: number): Promise<null> {
    await this.recordRepository.delete(id);
    return null;
  }

  @OpenAPI({ summary: 'Update a record' })
  @HttpCode(204)
  @UseBefore(validationMiddleware(Record, 'body', ['update']))
  @Patch('/')
  async update(@QueryParam('opt') opt: FindOptionsWhere<Record>, @Body() body: Record): Promise<null> {
    await this.recordRepository.existOneOrFail(opt);
    await this.recordRepository.update(opt, body);
    return null;
  }

  @OpenAPI({ summary: 'Create a record' })
  @HttpCode(201)
  @UseBefore(validationMiddleware(Record, 'body', ['create']))
  @Post('/')
  async create(@Body() body: Record): Promise<unknown> {
    await this.recordRepository.insert(body);
    return '';
  }

  @OpenAPI({ summary: 'Upsert a record' })
  @HttpCode(204)
  @UseBefore(validationMiddleware(Record, 'body', ['upsert']))
  @Post('/upsert')
  async upsert(@Body() body: Record[]): Promise<null> {
    await this.recordRepository.save(body);
    return null;
  }

  // 下方仅是模拟业务需要

  @OpenAPI({ summary: 'Return a list of records by dto' })
  @ResponseSchema(Record, {
    isArray: true,
  })
  @UseBefore(validationMiddleware(GetRecordsTestDto, 'query'))
  @Get('/getByLike')
  async getByLike(@QueryParams() queryParams: GetRecordsTestDto): Promise<Record[]> {
    return this.recordService.getByLike(queryParams);
  }

  @OpenAPI({ summary: 'Delete a record and create a record' })
  @UseBefore(validationMiddleware(Record, 'body', ['create']))
  @Post('/deleteAndCreate/:id')
  async deleteAndCreate(@Param('id') id: number, @Body() body: Record): Promise<string> {
    await this.recordService.deleteAndCreate(id, body);
    return 'Success';
  }
}
