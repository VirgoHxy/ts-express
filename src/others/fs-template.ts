import path from 'path';
import { delSync, readSync, writeSync } from './fs';

class CreateConfig {
  /** @param {string} moduleName 模块名称 */
  public moduleName: string;
  /** @param {string} repositoryName 仓库名称 */
  public repositoryName: string;
  /** @param {boolean} [isCreateService = false] 是否创建service */
  public isCreateService: boolean;
  public typeArr = [
    ['entity', 'entities'],
    ['dto', 'dtos'],
    ['controller', 'controllers'],
    ['repository', 'repositories'],
    ['service', 'services'],
  ];
  public lowerModuleName: string;
  public upperModuleName: string;
  constructor(moduleName: string, repositoryName: string, isCreateService = false) {
    this.moduleName = moduleName;
    this.repositoryName = repositoryName;
    this.isCreateService = isCreateService;
    this.lowerModuleName = moduleName;
    this.upperModuleName = moduleName.replace(moduleName[0], moduleName[0].toUpperCase());
  }

  getTemplate(type: string) {
    switch (type) {
      case 'entity':
        return this.getEntityTemplate();
      case 'dto':
        return this.getDtoTemplate();
      case 'controller':
        return this.getControllerTemplate();
      case 'repository':
        return this.getRepositoryTemplate();
      case 'service':
        return this.getServiceTemplate();

      default:
        throw new Error(`Unknown type ${type}`);
    }
  }

  getEntityTemplate(): string {
    const upperModuleName = this.upperModuleName;
    let str = `import { plainToInstance } from 'class-transformer';
import { IsDate, IsInt, IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ${upperModuleName}Dto } from '../dtos';

@Entity()
export class ${upperModuleName} {
  constructor(data: ${upperModuleName}Dto) {
    return plainToInstance(${upperModuleName}, data);
  }

  @PrimaryGeneratedColumn()
  @IsInt()
  id: number;

  @Column({
    type: 'varchar',
  })
  @IsString()
  temp: string;

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
`;
    return str;
  }

  getDtoTemplate(): string {
    const upperModuleName = this.upperModuleName;
    let str = `import { IsEmpty, IsInt, IsOptional, IsString, NotEquals } from 'class-validator';

export class ${upperModuleName}Dto {
  @IsEmpty({ groups: ['create', 'update'] })
  @NotEquals('', { groups: ['create', 'update'] })
  @IsOptional({ groups: ['upsert', 'find'] }) // 在upsert,find生效 如果缺失这个值 就忽略其他验证
  @IsInt()
  id: number;

  @IsString()
  temp: number;
}
`;
    return str;
  }

  getControllerTemplate(): string {
    const lowerModuleName = this.lowerModuleName;
    const upperModuleName = this.upperModuleName;
    let str = `import {
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
import { FindManyOptionsDto, ${upperModuleName}Dto } from '../dtos';
import { ${upperModuleName} } from '../entities';
import { authMiddleware, resultMiddleware, validationMiddleware } from '../middlewares';
import { ${upperModuleName}Repository } from '../repositories';
import { ${upperModuleName}Service } from '../services';

@JsonController('/${lowerModuleName}s')
@UseBefore(authMiddleware, resultMiddleware)
export class ${upperModuleName}Controller {
  constructor(@Service() private ${lowerModuleName}Repository: ${upperModuleName}Repository, @Service() private ${lowerModuleName}Service: ${upperModuleName}Service) {}

  @OpenAPI({ summary: 'Return a list of ${lowerModuleName}s by opt' })
  @ResponseSchema(${upperModuleName}, { isArray: true })
  @UseBefore(validationMiddleware(FindManyOptionsDto, 'query'))
  @Get('/')
  async find(
    @QueryParams({ validate: false }) opt?: FindManyOptionsDto<${upperModuleName}>,
  ): Promise<{ count: number; results: ${upperModuleName}[] }> {
    const count = await this.${lowerModuleName}Repository.count(opt);
    const results = await this.${lowerModuleName}Repository.find(opt);
    return {
      count,
      results,
    };
  }

  @OpenAPI({ summary: 'Return a count number of ${lowerModuleName}s by where' })
  @ResponseSchema(Number)
  @UseBefore(validationMiddleware(${upperModuleName}Dto, 'query', ['find']))
  @Get('/count')
  async count(@QueryParams({ validate: false }) where?: ${upperModuleName}Dto): Promise<number> {
    const count = await this.${lowerModuleName}Repository.countBy(where);
    return count;
  }

  @OpenAPI({ summary: 'Return a ${lowerModuleName} by id' })
  @ResponseSchema(${upperModuleName})
  @UseBefore(validationMiddleware(${upperModuleName}Dto, 'params'))
  @Get('/:id')
  async findById(@Params({ validate: false, required: true }) where: ${upperModuleName}Dto): Promise<${upperModuleName}> {
    await this.${lowerModuleName}Repository.existOnlyOneOrFail(where);
    const result = await this.${lowerModuleName}Repository.findOneBy(where);
    return result;
  }

  @OpenAPI({ summary: 'Update a ${lowerModuleName} by id' })
  @HttpCode(204)
  @UseBefore(validationMiddleware(${upperModuleName}Dto, 'params'), validationMiddleware(${upperModuleName}Dto, 'body', ['update']))
  @Patch('/:id')
  async updateById(
    @Params({ validate: false, required: true }) where: ${upperModuleName}Dto,
    @Body({ validate: false, required: true }) body: ${upperModuleName}Dto,
  ): Promise<null> {
    await this.${lowerModuleName}Repository.existOnlyOneOrFail(where);
    await this.${lowerModuleName}Repository.update(where.id, body);
    return null;
  }

  @OpenAPI({ summary: 'Delete a ${lowerModuleName} by id' })
  @HttpCode(204)
  @UseBefore(validationMiddleware(${upperModuleName}Dto, 'params'))
  @Delete('/:id')
  async deleteById(@Params({ validate: false, required: true }) where: ${upperModuleName}Dto): Promise<null> {
    await this.${lowerModuleName}Repository.delete(where.id);
    return null;
  }

  @OpenAPI({ summary: 'Update a ${lowerModuleName} by where' })
  @HttpCode(204)
  @UseBefore(validationMiddleware(${upperModuleName}Dto, 'query', ['find']), validationMiddleware(${upperModuleName}Dto, 'body', ['update']))
  @Patch('/')
  async update(
    @QueryParams({ validate: false }) where: ${upperModuleName}Dto,
    @Body({ validate: false, required: true }) body: ${upperModuleName}Dto,
  ): Promise<null> {
    await this.${lowerModuleName}Repository.existOnlyOneOrFail(where);
    await this.${lowerModuleName}Repository.update(where, body);
    return null;
  }

  @OpenAPI({ summary: 'Create a ${lowerModuleName}' })
  @HttpCode(201)
  @ResponseSchema(String)
  @UseBefore(validationMiddleware(${upperModuleName}Dto, 'body', ['create']))
  @Post('/')
  async create(@Body({ validate: false, required: true }) body: ${upperModuleName}Dto): Promise<string> {
    await this.${lowerModuleName}Repository.insert(body);
    return 'OK';
  }

  @OpenAPI({ summary: 'Upsert ${lowerModuleName}s' })
  @HttpCode(204)
  @UseBefore(validationMiddleware(${upperModuleName}Dto, 'body', ['upsert']))
  @Post('/upsert')
  async upsert(@Body({ validate: false, required: true }) body: ${upperModuleName}Dto[]): Promise<null> {
    await this.${lowerModuleName}Repository.save(body);
    return null;
  }
}
`;
    if (!this.isCreateService) {
      str = str.replace(`\r\nimport { ${upperModuleName}Service } from '../services';`, '');
      str = str.replace(`, @Service() private ${lowerModuleName}Service: ${upperModuleName}Service`, '');
    }
    return str;
  }

  getRepositoryTemplate(): string {
    const upperModuleName = this.upperModuleName;
    const upperRepositoryName = this.repositoryName.replace(
      this.repositoryName[0],
      this.repositoryName[0].toUpperCase(),
    );
    let str = `
@Service()
export class ${upperModuleName}Repository extends ${upperRepositoryName}CustomRepository<${upperModuleName}> {
  constructor() {
    super(${upperModuleName});
  }
}
`;
    return str;
  }

  getServiceTemplate(): string {
    const lowerModuleName = this.lowerModuleName;
    const upperModuleName = this.upperModuleName;
    let str = `import { Service } from 'typedi';
import { ${upperModuleName}Repository } from '../repositories';

@Service()
export class ${upperModuleName}Service {
  constructor(@Service() private ${lowerModuleName}Repository: ${upperModuleName}Repository) {}
}
`;
    return str;
  }
}

function create(config: CreateConfig) {
  const templatePathArr = [];
  try {
    for (let index = 0; index < config.typeArr.length; index++) {
      const element = config.typeArr[index];
      const templateStr = config.getTemplate(element[0]);
      let templatePath = path.resolve(__dirname, `../${element[1]}/${config.moduleName}.${element[0]}.ts`);
      try {
        if (element[0] === 'repository') {
          templatePath = path.resolve(__dirname, `../${element[1]}/${config.repositoryName}.${element[0]}.ts`);
          const regexp = /import { (.*) } from '.*entities';/;
          let fileStr = readSync(templatePath) as string;
          if (!fileStr.includes(`${config.upperModuleName}Repository`)) {
            if (regexp.test(fileStr)) {
              fileStr = fileStr.replace(regexp, (_, p1) => {
                return `import { ${p1}, ${config.upperModuleName} } from '../entities';`;
              });
            } else {
              fileStr = fileStr.replace(
                /import { .* } from 'typeorm';/,
                match => `${match}\r\nimport { ${config.upperModuleName} } from '../entities';`,
              );
            }
            writeSync(templatePath, fileStr, 'u');
            writeSync(templatePath, templateStr, 'a');
          }
        } else {
          writeSync(templatePath, templateStr);
          templatePathArr.push(templatePath);
        }
        console.log(`${element[0]}写入成功`);
      } catch (error) {
        console.log(`${element[0]}写入失败`);
        throw error;
      }
    }
    for (let index = 0; index < config.typeArr.length; index++) {
      const element = config.typeArr[index];
      if (element[0] === 'repository') continue;
      const indexPath = path.resolve(__dirname, `../${element[1]}/index.ts`);
      const indexStr = `export * from './${config.moduleName}.${element[0]}';\r\n`;
      const fileStr = readSync(indexPath) as string;
      if (!fileStr.includes(`${config.moduleName}.${element[0]}`)) {
        writeSync(indexPath, indexStr, 'a');
      }
    }
    console.log('index.ts导出写入成功');
    console.log('全部写入成功');
  } catch (error) {
    for (const templatePath of templatePathArr) {
      delSync(templatePath);
    }
    console.log('写入失败：', error);
  }
}

create(new CreateConfig('route', 'mysql', true));
