import { FailedResult, HttpException } from '@others';
import { loggerInstance } from '@plugins';
import { NextFunction, Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (err: HttpException, req: Request, res: Response, _next: NextFunction) => {
  try {
    const logger = loggerInstance.getLogger('error_middleware');
    const status: number = err.status || 500;
    const message: string = err.message || 'Something went wrong';
    console.log(JSON.stringify(err, null, 2));
    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    res.status(status).json(new FailedResult(err));
  } catch (error) {
    res.status(500).json(new FailedResult(error));
  }
};
