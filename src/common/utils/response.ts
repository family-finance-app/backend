import { HttpStatus } from '@nestjs/common';

export const buildSuccessResponse = <T>(
  data: T,
  message: string,
  statusCode: HttpStatus,
  path: string,
) => {
  return {
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
    path,
  };
};
