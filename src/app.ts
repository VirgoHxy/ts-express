import { defaultMetadataStorage } from 'class-transformer/cjs/storage';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import { writeFile } from 'fs';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import path from 'path';
import 'reflect-metadata';
import { getMetadataArgsStorage, useContainer, useExpressServer } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import serveStatic from 'serve-static';
import swaggerUi from 'swagger-ui-express';
import Container from 'typedi';
import { appConfig } from './config';
import * as controllers from './controllers';
import { initDataSource } from './datasources';
import { errorMiddleware } from './middlewares';
import { loggerInstance } from './plugins';

export default class App {
  public static instance = new App();
  public app: express.Application;
  private port = appConfig.port || 3000;
  private logger = loggerInstance.getLogger('app');

  constructor() {
    const controllersArr = Object.values(controllers).map(ele => ele);

    this.app = express();

    this.set();
    this.initMiddlewares();
    this.initRoutes(controllersArr);
    this.initSwagger(controllersArr);
    // 错误处理必须要放在最后use
    this.initErrorHandling();
  }

  public async run() {
    await this.asyncSet();
    this.app.listen(this.port, () => {
      const url = `http://127.0.0.1:${this.port}`;
      this.logger.info(`Server is running at ${url}`);
      this.logger.info(`Try ${url}/ping`);
    });
  }

  private set() {
    this.app.use(serveStatic('public', { index: ['index.html'] }));
    // 使用依赖注入
    useContainer(Container);
  }

  private async asyncSet() {
    // 初始化数据库
    await initDataSource();
  }

  private initMiddlewares() {
    // 请求响应
    this.app.use(
      morgan(appConfig.morgan_format, {
        skip(req, res) {
          if (req.baseUrl === '/api-docs' || req.path === '/' || req.path === '/favicon.ico') {
            return true;
          } else if (res.statusCode === 200) {
            return true;
          }
        },
        stream: {
          write: (message: string) => {
            this.logger.info(message.substring(0, message.lastIndexOf('\n')));
          },
        },
      }),
    );
    // 跨域
    // this.app.use(cors({ origin: appConfig.origin, credentials: true }));
    // 安全
    this.app.use(hpp());
    this.app.use(helmet());
    // 压缩
    this.app.use(compression());
    // json body解析
    this.app.use(express.json());
    // url参数解析
    this.app.use(express.urlencoded({ extended: true }));
    // req.cookies
    this.app.use(cookieParser());
    // 统一成功响应体 在控制器中定义
    // this.app.use(resultMiddleware);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private initRoutes(controllers: Function[]) {
    useExpressServer(this.app, {
      cors: {
        origin: appConfig.origin,
        credentials: true,
      },
      controllers: controllers,
      defaultErrorHandler: false,
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private initSwagger(controllers: Function[]) {
    const schemas = validationMetadatasToSchemas({
      classTransformerMetadataStorage: defaultMetadataStorage,
      refPointerPrefix: '#/components/schemas/',
    });

    const routingControllersOptions = {
      controllers: controllers,
    };

    const storage = getMetadataArgsStorage();
    const spec = routingControllersToSpec(storage, routingControllersOptions, {
      info: {
        description: 'Generated with `routing-controllers-openapi`',
        title: 'API',
        version: '1.0.0',
      },
      components: {
        schemas,
        securitySchemes: {
          bearerAuth: {
            type: 'apiKey',
            scheme: 'bearer',
            in: 'header',
            name: 'Authorization',
          },
        },
      },
      security: [{ bearerAuth: [] }],
      servers: [{ url: `http://127.0.0.1:${appConfig.port}/` }],
    });
    writeFile(path.resolve(__dirname, '../public/openapi.json'), JSON.stringify(spec), error => {
      if (error) {
        this.logger.warn(error);
      }
    });
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
    this.app.use('/openapi.json', (_req, res) => {
      res.send(spec);
    });
  }

  private initErrorHandling() {
    this.app.use(errorMiddleware);
  }
}
