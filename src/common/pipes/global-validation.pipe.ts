import { ValidationPipe, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import {
  ApiErrorException,
  ErrorCode,
} from '../exceptions/api-error.exception.js';

export function buildGlobalValidationPipe() {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[] = []) => {
      const issues = collectValidationIssues(errors);
      const mapped = mapValidationIssues(issues);

      return new ApiErrorException(
        mapped.message,
        mapped.errorCode,
        mapped.statusCode,
        { issues },
      );
    },
  });
}

function collectValidationIssues(errors: ValidationError[], parentPath = '') {
  const issues: ValidationIssue[] = [];

  for (const err of errors) {
    const fieldPath = parentPath
      ? `${parentPath}.${err.property}`
      : err.property;
    const messages = err.constraints ? Object.values(err.constraints) : [];
    const isMissing =
      err.value === undefined || err.value === null || err.value === '';

    if (messages.length || isMissing) {
      issues.push({ field: fieldPath, messages, isMissing });
    }

    if (err.children && err.children.length > 0) {
      issues.push(...collectValidationIssues(err.children, fieldPath));
    }
  }

  return issues;
}

type ValidationIssue = {
  field: string;
  messages: string[];
  isMissing?: boolean;
};

const validationIssueMap: Record<
  string,
  { code: ErrorCode; status: HttpStatus; message?: string }
> = {
  currency: {
    code: ErrorCode.INVALID_CURRENCY,
    status: HttpStatus.BAD_REQUEST,
    message: 'Invalid currency',
  },
  type: {
    code: ErrorCode.INVALID_ACCOUNT_TYPE,
    status: HttpStatus.BAD_REQUEST,
    message: 'Invalid account type',
  },
};

function mapValidationIssues(issues: ValidationIssue[]) {
  const fallback = {
    statusCode: HttpStatus.BAD_REQUEST,
    errorCode: ErrorCode.VALIDATION_ERROR,
    message: 'Validation failed',
  };

  const first = issues[0];
  if (!first) return fallback;

  if (first.isMissing) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: ErrorCode.MISSING_FIELD,
      message: `Field "${first.field}" is required`,
    };
  }

  const mapped = validationIssueMap[first.field];
  if (mapped) {
    return {
      statusCode: mapped.status,
      errorCode: mapped.code,
      message: mapped.message ?? first.messages[0] ?? fallback.message,
    };
  }

  return {
    statusCode: HttpStatus.BAD_REQUEST,
    errorCode: fallback.errorCode,
    message: first.messages[0] ?? fallback.message,
  };
}
