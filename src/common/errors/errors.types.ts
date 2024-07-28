import { HttpException, HttpExceptionOptions } from '@nestjs/common';

export class ClientManagedError extends HttpException {
  public code?: BackendErrorCode;
  constructor(
    response: any,
    status: number,
    code?: BackendErrorCode,
    options?: HttpExceptionOptions,
  ) {
    super(response, status, options);
    this.code = code;
  }
}

/**
 * For custom frontend error handling 
 */
export enum BackendErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
}
