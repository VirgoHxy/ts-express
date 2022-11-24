import { HttpException } from '@others';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError, ValidatorOptions } from 'class-validator';
import { RequestHandler } from 'express';

const getAllNestedErrors = (error: ValidationError): string[] | string | undefined => {
  if (error.constraints) {
    return Object.values(error.constraints);
  }
  return error.children?.map(getAllNestedErrors).join(',');
};

export const validationMiddleware = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any,
  value: 'body' | 'query' | 'params' = 'body',
  groups?: string[],
  // true 则跳过验证对象中未定义和null的的字段验证
  skipMissingProperties = false,
  // 非dto的属性报错
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (req: { [prop: string]: any }, _res, next) => {
    const obj = plainToInstance(type, req[value]);
    if (value === 'query' || value === 'params') {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          let element = obj[key];
          if (typeof element === 'string') {
            try {
              obj[key] = JSON.parse(element);
            } catch {}
          }
        }
      }
    }

    try {
      const validatorOptions: ValidatorOptions = { skipMissingProperties, whitelist, forbidNonWhitelisted, groups };
      let errors: ValidationError[] = [];
      if (Array.isArray(obj)) {
        for (const iterator of obj) {
          let temp = await validate(iterator, validatorOptions);
          if (temp.length > 0) errors.push(...temp);
        }
      } else {
        errors = await validate(obj, validatorOptions);
      }
      if (errors.length > 0) {
        const message = errors.map(getAllNestedErrors).join(', ');
        throw new Error(message);
      }
      next();
    } catch (error) {
      next(new HttpException(400, error.message));
    }
  };
};
