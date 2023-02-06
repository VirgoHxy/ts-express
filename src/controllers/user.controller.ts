import { jwtPluginInstance } from '@plugins';
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
import { FindManyOptionsDto, RefreshTokenDto, UserDto } from '../dtos';
import { User } from '../entities';
import { authMiddleware, resultMiddleware, validationMiddleware } from '../middlewares';
import { UserRepository } from '../repositories';
import { UserService } from '../services';

@JsonController('/users')
@UseBefore(resultMiddleware)
export class UserController {
  constructor(@Service() private userRepository: UserRepository, @Service() private userService: UserService) {}

  @OpenAPI({ summary: 'Return a list of users by opt' })
  @ResponseSchema(User, { isArray: true })
  @UseBefore(authMiddleware, validationMiddleware(FindManyOptionsDto, 'query'))
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
  @UseBefore(authMiddleware, validationMiddleware(UserDto, 'query', ['find']))
  @Get('/count')
  async count(@QueryParams({ validate: false }) where?: UserDto): Promise<number> {
    const count = await this.userRepository.countBy(where);
    return count;
  }

  @OpenAPI({ summary: 'Return a user by id' })
  @ResponseSchema(User)
  @UseBefore(authMiddleware, validationMiddleware(UserDto, 'params'))
  @Get('/:id')
  async findById(@Params({ validate: false, required: true }) where: UserDto): Promise<User> {
    await this.userRepository.existOnlyOneOrFail(where);
    const result = await this.userRepository.findOneBy(where);
    return result;
  }

  @OpenAPI({ summary: 'Update a user by id' })
  @HttpCode(204)
  @UseBefore(authMiddleware, validationMiddleware(UserDto, 'params'), validationMiddleware(UserDto, 'body', ['update']))
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
  @UseBefore(authMiddleware, validationMiddleware(UserDto, 'params'))
  @Delete('/:id')
  async deleteById(@Params({ validate: false, required: true }) where: UserDto): Promise<null> {
    await this.userRepository.delete(where.id);
    return null;
  }

  @OpenAPI({ summary: 'Update a user by where' })
  @HttpCode(204)
  @UseBefore(
    authMiddleware,
    validationMiddleware(UserDto, 'query', ['find']),
    validationMiddleware(UserDto, 'body', ['update']),
  )
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
  @UseBefore(authMiddleware, validationMiddleware(UserDto, 'body', ['create']))
  @Post('/')
  async create(@Body({ validate: false, required: true }) body: UserDto): Promise<string> {
    await this.userRepository.insert(body);
    return 'OK';
  }

  @OpenAPI({ summary: 'Upsert users' })
  @HttpCode(204)
  @UseBefore(authMiddleware, validationMiddleware(UserDto, 'body', ['upsert']))
  @Post('/upsert')
  async upsert(@Body({ validate: false, required: true }) body: UserDto[]): Promise<null> {
    await this.userRepository.save(body);
    return null;
  }

  @OpenAPI({ summary: 'Login' })
  @HttpCode(200)
  @UseBefore(validationMiddleware(UserDto, 'body', ['login']))
  @Post('/login')
  async login(@Body({ validate: false, required: true }) body: UserDto) {
    const token = jwtPluginInstance.sign({ user: 'hxy' });
    if (body.account === 'admin') {
      return {
        account: 'admin',
        // 一个用户可能有多个角色
        roles: ['admin'],
        accessToken: token,
        refreshToken: 'eyJhbGciOiJIUzUxMiJ9.adminRefresh',
        expires: '2023/10/30 00:00:00',
      };
    } else {
      return {
        account: 'common',
        // 一个用户可能有多个角色
        roles: ['common'],
        accessToken: token,
        refreshToken: 'eyJhbGciOiJIUzUxMiJ9.commonRefresh',
        expires: '2023/10/30 00:00:00',
      };
    }
  }

  @OpenAPI({ summary: 'refreshToken' })
  @HttpCode(200)
  @UseBefore(validationMiddleware(RefreshTokenDto, 'body'))
  @Post('/refreshToken')
  async refreshToken(@Body({ validate: false, required: true }) body: RefreshTokenDto) {
    if (body.refreshToken) {
      const token = jwtPluginInstance.sign({ user: 'hxy' });
      return {
        accessToken: token,
        refreshToken: 'eyJhbGciOiJIUzUxMiJ9.newAdminRefresh',
        // `expires`选择这种日期格式是为了方便调试，后端直接设置时间戳或许更方便（每次都应该递增）。如果后端返回的是时间戳格式，前端开发请来到这个目录`src/utils/auth.ts`，把第`38`行的代码换成expires = data.expires即可。
        expires: '2023/10/30 23:59:59',
      };
    }
  }
}
