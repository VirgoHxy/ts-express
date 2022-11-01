import { appConfig } from '@config';

export class Result<T> {
  status: boolean;
  data?: T | undefined;
  msg?: string | undefined;
  error?: unknown;

  constructor(status: boolean, data?: T, msg?: string, error?: unknown) {
    this.status = status;
    this.data = data;
    this.msg = msg;
    this.error = error;
  }
}

export class SuccessResult<T> extends Result<T> {
  constructor(data?: T, msg?: string) {
    super(true);
    this.data = data;
    this.msg = msg;
  }
}

export class FailedResult<T> extends Result<T> {
  constructor(error?: Error, msg?: string) {
    super(false);
    if (appConfig.debug) {
      this.error = error.stack.toString().split(/\n.*at\s/);
    }
    this.msg = msg || error.message;
  }
}
