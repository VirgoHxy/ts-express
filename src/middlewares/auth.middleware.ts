import { appConfig } from '@config';
import { HttpException } from '@others';
import { JWTPlugin, TokenConstant } from '@plugins';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const tokenConstant: TokenConstant = {
  SECRET_KEY: appConfig.jwt.secret,
  EXPIRATION: appConfig.jwt.expiresIn,
  ALGORITHM: appConfig.jwt.algorithm as jwt.Algorithm,
};
const jwtPlugin = new JWTPlugin(tokenConstant);
if (appConfig.debug) console.log(jwtPlugin.sign({ user: 'hxy' }));

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  try {
    let authorization = req.headers.authorization;
    if (!authorization) {
      throw new HttpException(401, 'Authorization not found in request header!');
    }
    authorization = authorization.slice(0, 7) === 'Bearer ' ? authorization.slice(7) : authorization;
    const jwtToken = authorization || null;
    if (!jwtToken) {
      throw new HttpException(401, 'Authorization not found in request header!');
    }
    try {
      jwtPlugin.verify(jwtToken);
    } catch (error) {
      throw new HttpException(401, error.message);
    }
    next();
  } catch (error) {
    next(error);
  }
};
