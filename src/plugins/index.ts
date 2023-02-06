import { appConfig } from '@config';
import { JWTPlugin, TokenConstant } from '@plugins';
import jwt from 'jsonwebtoken';
import { Logger } from './winston.plugin';

const tokenConstant: TokenConstant = {
  SECRET_KEY: appConfig.jwt.secret,
  EXPIRATION: appConfig.jwt.expiresIn,
  ALGORITHM: appConfig.jwt.algorithm as jwt.Algorithm,
};

export * from './jwt.plugin';
export const loggerInstance = Logger.instance;
export const jwtPluginInstance = new JWTPlugin(tokenConstant);
