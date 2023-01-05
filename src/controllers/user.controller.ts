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
import { FindManyOptionsDto, UserDto } from '../dtos';
import { User } from '../entities';
import { authMiddleware, resultMiddleware, validationMiddleware } from '../middlewares';
import { UserRepository } from '../repositories';
import { UserService } from '../services';

@JsonController('/users')
@UseBefore(authMiddleware, resultMiddleware)
export class UserController {
  constructor(@Service() private userRepository: UserRepository, @Service() private userService: UserService) {}

  @OpenAPI({ summary: 'Return a list of users by opt' })
  @ResponseSchema(User, { isArray: true })
  @UseBefore(validationMiddleware(FindManyOptionsDto, 'query'))
  @Get('/')
  async find(
    @QueryParams({ validate: false }) opt?: FindManyOptionsDto<User>,
  ): Promise<{ count: number; results: User[] }> {
    const count = await this.userRepository.count(opt);
    const results = await this.userRepository.find(opt);
    return {
      count,
      results,
    };
  }

  @OpenAPI({ summary: 'Return a count number of users by where' })
  @ResponseSchema(Number)
  @UseBefore(validationMiddleware(UserDto, 'query', ['find']))
  @Get('/count')
  async count(@QueryParams({ validate: false }) where?: UserDto): Promise<number> {
    const count = await this.userRepository.countBy(where);
    return count;
  }

  @OpenAPI({ summary: 'Return a user by id' })
  @ResponseSchema(User)
  @UseBefore(validationMiddleware(UserDto, 'params'))
  @Get('/:id')
  async findById(@Params({ validate: false, required: true }) where: UserDto): Promise<User> {
    await this.userRepository.existOnlyOneOrFail(where);
    const result = await this.userRepository.findOneBy(where);
    return result;
  }

  @OpenAPI({ summary: 'Update a user by id' })
  @HttpCode(204)
  @UseBefore(validationMiddleware(UserDto, 'params'), validationMiddleware(UserDto, 'body', ['update']))
  @Patch('/:id')
  async updateById(
    @Params({ validate: false, required: true }) where: UserDto,
    @Body({ validate: false, required: true }) body: UserDto,
  ): Promise<null> {
    await this.userRepository.existOnlyOneOrFail(where);
    await this.userRepository.update(where.id, body);
    return null;
  }

  @OpenAPI({ summary: 'Delete a user by id' })
  @HttpCode(204)
  @UseBefore(validationMiddleware(UserDto, 'params'))
  @Delete('/:id')
  async deleteById(@Params({ validate: false, required: true }) where: UserDto): Promise<null> {
    await this.userRepository.delete(where.id);
    return null;
  }

  @OpenAPI({ summary: 'Update a user by where' })
  @HttpCode(204)
  @UseBefore(validationMiddleware(UserDto, 'query', ['find']), validationMiddleware(UserDto, 'body', ['update']))
  @Patch('/')
  async update(
    @QueryParams({ validate: false }) where: UserDto,
    @Body({ validate: false, required: true }) body: UserDto,
  ): Promise<null> {
    await this.userRepository.existOnlyOneOrFail(where);
    await this.userRepository.update(where, body);
    return null;
  }

  @OpenAPI({ summary: 'Create a user' })
  @HttpCode(201)
  @ResponseSchema(String)
  @UseBefore(validationMiddleware(UserDto, 'body', ['create']))
  @Post('/')
  async create(@Body({ validate: false, required: true }) body: UserDto): Promise<string> {
    await this.userRepository.insert(body);
    return 'OK';
  }

  @OpenAPI({ summary: 'Upsert users' })
  @HttpCode(204)
  @UseBefore(validationMiddleware(UserDto, 'body', ['upsert']))
  @Post('/upsert')
  async upsert(@Body({ validate: false, required: true }) body: UserDto[]): Promise<null> {
    await this.userRepository.save(body);
    return null;
  }
}
