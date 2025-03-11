# Error Handling Guide

## Overview
Our error handling system provides a robust framework for managing, logging, and responding to errors across the application. It includes custom error classes, middleware, and standardized error responses.

## Core Error System

### Base Error Classes
Foundation of our error handling:

```typescript
// Base application error
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

// HTTP-specific errors
class HttpError extends AppError {
  constructor(
    message: string,
    statusCode: number,
    code: string = 'HTTP_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message, code, statusCode, details);
  }
}

// Validation errors
class ValidationError extends AppError {
  constructor(
    message: string,
    public validationErrors: ValidationErrorDetail[]
  ) {
    super(message, 'VALIDATION_ERROR', 400, {
      errors: validationErrors,
    });
  }
}
```

## Error Middleware

### Global Error Handler
Central error processing middleware:

```typescript
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../logging';

export function globalErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const logger = new Logger('ErrorHandler');

  // Log error details
  logger.error('Unhandled error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    request: {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      body: req.body,
    },
  });

  // Handle known error types
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(error.toJSON());
  }

  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.validationErrors,
      },
    });
  }

  // Handle unexpected errors
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
```

## Database Error Handling

### Database Error Wrapper
Standardized database error handling:

```typescript
class DatabaseError extends AppError {
  constructor(
    message: string,
    public originalError: Error,
    code: string = 'DATABASE_ERROR'
  ) {
    super(message, code, 500, {
      originalError: {
        message: originalError.message,
        code: (originalError as any).code,
      },
    });
  }
}

async function withDbErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      throw new DatabaseError(
        'Duplicate entry found',
        error,
        'UNIQUE_VIOLATION'
      );
    }
    if (error.code === '23503') { // Foreign key violation
      throw new DatabaseError(
        'Referenced record not found',
        error,
        'FOREIGN_KEY_VIOLATION'
      );
    }
    throw new DatabaseError(errorMessage, error);
  }
}

// Usage example
async function createUser(userData: UserInput): Promise<User> {
  return withDbErrorHandling(
    async () => {
      const user = await db.users.create(userData);
      return user;
    },
    'Failed to create user'
  );
}
```

## API Error Responses

### Standardized Error Responses
Consistent error response format:

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    path?: string;
    timestamp?: string;
  };
}

class ApiError extends AppError {
  toResponse(): ErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        path: this.details?.path as string,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// Error response middleware
function errorResponseMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json(error.toResponse());
  }
  next(error);
}
```

## Async Error Handling

### Async Wrapper
Utility for handling async errors:

```typescript
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage in routes
router.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await userService.findById(req.params.id);
    if (!user) {
      throw new HttpError('User not found', 404, 'USER_NOT_FOUND');
    }
    res.json(user);
  })
);
```

## Validation Error Handling

### Request Validation
Input validation with detailed errors:

```typescript
class RequestValidator {
  static validate<T>(schema: Schema, data: unknown): T {
    try {
      return schema.parse(data) as T;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(
          'Invalid request data',
          error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            code: 'INVALID_FIELD'
          }))
        );
      }
      throw error;
    }
  }
}

// Validation middleware
function validateRequest(schema: Schema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.validatedData = RequestValidator.validate(schema, req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}
```

## Error Monitoring

### Error Tracking
Integration with error monitoring services:

```typescript
class ErrorTracker {
  private static instance: ErrorTracker;
  private readonly logger: Logger;

  private constructor() {
    this.logger = new Logger('ErrorTracker');
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  trackError(error: Error, context?: Record<string, unknown>): void {
    this.logger.error('Error tracked', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      timestamp: new Date().toISOString(),
    });

    // Send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorMonitoring(error, context);
    }
  }

  private async sendToErrorMonitoring(
    error: Error,
    context?: Record<string, unknown>
  ): Promise<void> {
    // Implementation for sending to error monitoring service
    // (e.g., Sentry, New Relic, etc.)
  }
}
``` 