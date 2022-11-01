import { FailedResult, SuccessResult } from '@others';
import { NextFunction, Request, Response } from 'express';

export const resultMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  const _json = res.json;
  // 只对json response有效
  res.json = body => {
    return _json.call(
      res,
      body === null || body === '' || body instanceof FailedResult ? body : new SuccessResult(body),
    );
  };
  next();
};
