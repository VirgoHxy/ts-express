import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestHandler } from 'express';
import { HttpException } from '../others';

const getAllNestedErrors = (error: ValidationError): string[] | string | undefined => {
  if (error.constraints) {
    return Object.values(error.constraints);
  }
  return error.children?.map(getAllNestedErrors).join(',');
};

export const validationMiddleware = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any,
  value: string | 'body' | 'query' | 'params' = 'body',
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (req: { [prop: string]: any }, _res, next) => {
    const obj = plainToInstance(type, req[value]);
    validate(obj, { skipMissingProperties, whitelist, forbidNonWhitelisted }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors.map(getAllNestedErrors).join(', ');
        next(new HttpException(400, message));
      } else {
        next();
      }
    });
  };
};
