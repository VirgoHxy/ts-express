import { appConfig } from '@config';
import { HttpException } from '@others';
import { jwtPluginInstance } from '@plugins';
import { NextFunction, Request, Response } from 'express';

let token: string;
if (appConfig.debug) {
  token = jwtPluginInstance.sign({ user: 'hxy' });
  console.log(token);
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  try {
    let authorization = req.headers.authorization;
    // // 本地测试使用 请不要放在正式环境
    // let authorization = token;
    if (!authorization) {
      throw new HttpException(401, 'Authorization not found in request header!');
    }
    authorization = authorization.slice(0, 7) === 'Bearer ' ? authorization.slice(7) : authorization;
    const jwtToken = authorization || null;
    if (!jwtToken) {
      throw new HttpException(401, 'Authorization not found in request header!');
    }
    try {
      jwtPluginInstance.verify(jwtToken);
    } catch (error) {
      throw new HttpException(401, error.message);
    }
    next();
  } catch (error) {
    next(error);
  }
};
