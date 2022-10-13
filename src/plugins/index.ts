import { Logger } from './winston.plugin';

export const loggerInstance = Logger.instance;
export const logger = Logger.instance.winstonLogger;
