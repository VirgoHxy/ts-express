import { defaultMetadataStorage } from 'class-transformer/cjs/storage';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { getMetadataArgsStorage, useExpressServer } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import serveStatic from 'serve-static';
import swaggerUi from 'swagger-ui-express';
import { appConfig } from './config';
import * as controllers from './controllers';
import { errorMiddleware } from './middlewares';
import { logger, loggerInstance } from './plugins';

class App {
  public static instance = new App();
  public app: express.Application;
  private port = appConfig.port || 3000;

  constructor() {
    const controllersArr = Object.values(controllers).map(ele => ele);
    loggerInstance.setLabelWithFile('app');

    this.app = express();

    this.initMiddlewares();
    this.initPublicFolder();
    this.initRoutes(controllersArr);
    this.initSwagger(controllersArr);
    this.initErrorHandling();
  }

  public run() {
    this.app.listen(this.port, () => {
      const url = `http://127.0.0.1:${this.port}`;
      logger.info(`Server is running at ${url}`);
      logger.info(`Try ${url}/ping`);
    });
  }

  private initMiddlewares() {
    // 请求响应
    this.app.use(
      morgan(appConfig.morgan_format, {
        skip(req, res) {
          if (req.baseUrl === '/api-docs' || req.path === '/') {
            return true;
          } else if (res.statusCode === 200) {
            return true;
          }
        },
        stream: {
          write: (message: string) => {
            logger.info(message.substring(0, message.lastIndexOf('\n')));
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
  }

  private initPublicFolder() {
    this.app.use(serveStatic('public', { index: ['index.html'] }));
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
      components: {
        schemas,
        securitySchemes: {
          basicAuth: {
            scheme: 'basic',
            type: 'http',
          },
        },
      },
      info: {
        description: 'Generated with `routing-controllers-openapi`',
        title: 'API',
        version: '1.0.0',
      },
    });

    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
  }

  private initErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
