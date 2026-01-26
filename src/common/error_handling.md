# Error & Validation Flow

This project standardizes validation and error responses across all layers. Use this document as a quick reference.

## Response Shapes

- Success: `{ statusCode, message, data, timestamp, path, requestId? }`
- Error: `{ statusCode, message, error, timestamp, path, requestId?, data? }`
  - `error` is a stable code from `ErrorCode` enum.
  - `data.issues` is used for validation details.

## Layers

### 1) DTO Validation (class-validator)

- Location: DTOs (e.g., `src/modules/accounts/dto/create.dto.ts`).
- Purpose: Enforce required fields/types/enums before business logic.
- On failure: ValidationPipe builds `ApiErrorException` (see below).

### 2) Global ValidationPipe

- Location: `src/common/pipes/global-validation.pipe.ts` (registered in `main.ts`).
- Behavior:
  - `whitelist: true`, `transform: true`.
  - `exceptionFactory` flattens `ValidationError[]` → `issues: [{ field, messages, isMissing? }]`.
  - Maps first issue to specific code/status:
    - Missing field → `statusCode: 400`, `error: MISSING_FIELD`, `message: Field "<field>" is required`.
    - `currency` invalid → `statusCode: 400`, `error: INVALID_CURRENCY`.
    - `type` invalid → `statusCode: 400`, `error: INVALID_ACCOUNT_TYPE`.
    - Other validation → `statusCode: 400`, `error: VALIDATION_ERROR`.
  - Returns `ApiErrorException` with `{ issues }` in `data`.

Example validation error response:

```json
{
  "statusCode": 400,
  "message": "Field \"currency\" is required",
  "error": "MISSING_FIELD",
  "timestamp": "2026-01-20T12:00:00.000Z",
  "path": "/accounts/create",
  "data": {
    "issues": [
      {
        "field": "currency",
        "messages": ["currency should not be empty"],
        "isMissing": true
      }
    ]
  }
}
```

### 3) Global Exception Filter

- File: `src/common/filters/api-http-exception.filter.ts`.
- Behavior:
  - If exception is `ApiErrorException`: return as-is.
  - If `HttpException`: map to `{ statusCode, message, error (from response.error or UNKNOWN_ERROR), timestamp, path }`.
  - Other errors: 500, `error: UNKNOWN_ERROR`.

### 4) Service-level Business Validation

- Example: `src/modules/accounts/accounts.service.ts`.
- Purpose: Business rules only (no presence/type checks). Typical cases:
  - Duplicate account: throws `ApiErrorException` `DUPLICATE_ACCOUNT`, `statusCode: 409`.
  - Prisma FK/Not found/etc. handled via `handlePrismaError` with mapped codes/statuses.
  - Not found for updates/deletes: `ACCOUNT_NOT_FOUND`, `statusCode: 404`.
  - Unexpected DB issues: `DATABASE_ERROR`, `statusCode: 500`.

Example duplicate response:

```json
{
  "statusCode": 409,
  "message": "Account with name \"My card\" and type \"CARD\" already exists",
  "error": "DUPLICATE_ACCOUNT",
  "timestamp": "2026-01-20T12:00:00.000Z",
  "path": "/accounts/create"
}
```

### 5) Success Responses

- Use `buildSuccessResponse(data, message, statusCode, path)`.
- Example create account success:

```json
{
  "statusCode": 201,
  "message": "New account has been successfully created",
  "data": {
    "account": {
      "id": 42,
      "name": "My card",
      "type": "CARD",
      "balance": 0,
      "currency": "UAH",
      "createdAt": "2026-01-20T12:00:00.000Z"
    }
  },
  "timestamp": "2026-01-20T12:00:00.000Z",
  "path": "/accounts/create"
}
```

## Error Codes (key ones)

- `MISSING_FIELD`, `VALIDATION_ERROR`, `INVALID_CURRENCY`, `INVALID_ACCOUNT_TYPE` (validation layer).
- `DUPLICATE_ACCOUNT` (409), `ACCOUNT_NOT_FOUND` (404), `INVALID_ACCOUNT_ID` (400), `USER_NOT_FOUND` (400), `DATABASE_ERROR` (500), `UNKNOWN_ERROR` (500 fallback).

## Extension Points

- To add field-specific validation codes: extend `validationIssueMap` in `main.ts`.
- To standardize new business errors: throw `ApiErrorException` with proper `ErrorCode` and `HttpStatus` in services.
- To include request correlation: add `requestId` to responses in `ApiHttpExceptionFilter` and `buildSuccessResponse` once available.
