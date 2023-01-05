import {
  Body,
  Delete,
  Get,
  HttpCode,
  JsonController,
  Params,
  Patch,
  Post,
  QueryParams,
  UseBefore,
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Service } from 'typedi';
import { FindManyOptionsDto, GetRecordsTestDto, RecordDto } from '../dtos';
import { Record } from '../entities';
import { authMiddleware, resultMiddleware, validationMiddleware } from '../middlewares';
import { RecordRepository } from '../repositories';
import { RecordService } from '../services';

@JsonController('/records')
@UseBefore(authMiddleware, resultMiddleware)
export class RecordController {
  constructor(@Service() private recordRepository: RecordRepository, @Service() private recordService: RecordService) {}

  @OpenAPI({ summary: 'Return a list of records by opt' })
  @ResponseSchema(Record, { isArray: true })
  @UseBefore(validationMiddleware(FindManyOptionsDto, 'query'))
  @Get('/')
  async find(
    @QueryParams({ validate: false }) opt?: FindManyOptionsDto<Record>,
  ): Promise<{ count: number; results: Record[] }> {
    const count = await this.recordRepository.count(opt);
    const results = await this.recordRepository.find(opt);
    return {
      count,
      results,
    };
  }

  @OpenAPI({ summary: 'Return a count number of records by where' })
  @ResponseSchema(Number)
  @UseBefore(validationMiddleware(RecordDto, 'query', ['find']))
  @Get('/count')
  async count(@QueryParams({ validate: false }) where?: RecordDto): Promise<number> {
    const count = await this.recordRepository.countBy(where);
    return count;
  }

  @OpenAPI({ summary: 'Return a record by id' })
  @ResponseSchema(Record)
  @UseBefore(validationMiddleware(RecordDto, 'params'))
  @Get('/:id')
  async findById(@Params({ validate: false, required: true }) where: RecordDto): Promise<Record> {
    await this.recordRepository.existOnlyOneOrFail(where);
    const result = await this.recordRepository.findOneBy(where);
    return result;
  }

  @OpenAPI({ summary: 'Update a record by id' })
  @HttpCode(204)
  @UseBefore(validationMiddleware(RecordDto, 'params'), validationMiddleware(RecordDto, 'body', ['update']))
  @Patch('/:id')
  async updateById(
    @Params({ validate: false, required: true }) where: RecordDto,
    @Body({ validate: false, required: true }) body: RecordDto,
  ): Promise<null> {
    await this.recordRepository.existOnlyOneOrFail(where);
    await this.recordRepository.update(where.id, body);
    return null;
  }

  @OpenAPI({ summary: 'Delete a record by id' })
  @HttpCode(204)
  @UseBefore(validationMiddleware(RecordDto, 'params'))
  @Delete('/:id')
  async deleteById(@Params({ validate: false, required: true }) where: RecordDto): Promise<null> {
    await this.recordRepository.delete(where.id);
    return null;
  }

  @OpenAPI({ summary: 'Update a record by where' })
  @HttpCode(204)
  @UseBefore(validationMiddleware(RecordDto, 'query', ['find']), validationMiddleware(RecordDto, 'body', ['update']))
  @Patch('/')
  async update(
    @QueryParams({ validate: false }) where: RecordDto,
    @Body({ validate: false, required: true }) body: RecordDto,
  ): Promise<null> {
    await this.recordRepository.existOnlyOneOrFail(where);
    await this.recordRepository.update(where, body);
    return null;
  }

  @OpenAPI({ summary: 'Create a record' })
  @HttpCode(201)
  @ResponseSchema(String)
  @UseBefore(validationMiddleware(RecordDto, 'body', ['create']))
  @Post('/')
  async create(@Body({ validate: false, required: true }) body: RecordDto): Promise<string> {
    await this.recordRepository.insert(body);
    return 'OK';
  }

  @OpenAPI({ summary: 'Upsert records' })
  @HttpCode(204)
  @UseBefore(validationMiddleware(RecordDto, 'body', ['upsert']))
  @Post('/upsert')
  async upsert(@Body({ validate: false, required: true }) body: RecordDto[]): Promise<null> {
    await this.recordRepository.save(body);
    return null;
  }

  // 下方仅是模拟业务需要

  @OpenAPI({ summary: 'Return a list of records by like' })
  @ResponseSchema(Record, { isArray: true })
  @UseBefore(validationMiddleware(GetRecordsTestDto, 'query'))
  @Post('/getByLike')
  async getByLike(@QueryParams({ validate: false }) queryParams: GetRecordsTestDto): Promise<Record[]> {
    return this.recordService.getByLike(queryParams);
  }

  @OpenAPI({ summary: 'Delete a record and create a record' })
  @ResponseSchema(String)
  @UseBefore(
    validationMiddleware(RecordDto, 'params', ['findById']),
    validationMiddleware(RecordDto, 'body', ['create']),
  )
  @Post('/deleteAndCreate/:id')
  async deleteAndCreate(
    @Params({ validate: false, required: true }) where: RecordDto,
    @Body({ validate: false, required: true }) body: RecordDto,
  ): Promise<string> {
    await this.recordService.deleteAndCreate(where.id, body);
    return 'OK';
  }
}
