import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiErrorException,
  ErrorCode,
} from '../exceptions/api-error.exception.js';

@Catch()
export class ApiHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (exception instanceof ApiErrorException) {
      const status = exception.getStatus();
      return response.status(status).json(exception.getResponse());
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const resBody = exception.getResponse() as any;
      const message = Array.isArray(resBody?.message)
        ? resBody.message.join('; ')
        : (resBody?.message ?? 'Unexpected error');
      const errorCode = resBody?.error ?? ErrorCode.UNKNOWN_ERROR;

      return response.status(status).json({
        statusCode: status,
        message,
        error: errorCode,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = 'Internal server error';
    this.logger.error('Unhandled exception', exception as any);

    return response.status(status).json({
      statusCode: status,
      message,
      error: ErrorCode.UNKNOWN_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
