/**
 * Error Handling Implementation
 * Provides custom error classes and utilities for handling errors
 */

/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
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
}

/**
 * HTTP error for API responses
 */
export class HttpError extends AppError {
  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_SERVER_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message, code, statusCode, details);
  }
}

/**
 * Database-specific error
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    public originalError: Error,
    code: string = 'DATABASE_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message, code, 500, details);
    this.stack = originalError.stack;
  }
}

/**
 * Validation error for invalid input data
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public validationErrors: Record<string, string[]>,
    code: string = 'VALIDATION_ERROR'
  ) {
    super(message, code, 400, { validationErrors });
  }
}

/**
 * Authentication error for unauthorized access
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = 'Authentication failed',
    code: string = 'AUTHENTICATION_ERROR'
  ) {
    super(message, code, 401);
  }
}

/**
 * Authorization error for insufficient permissions
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = 'Insufficient permissions',
    code: string = 'AUTHORIZATION_ERROR'
  ) {
    super(message, code, 403);
  }
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends AppError {
  constructor(
    resource: string,
    id?: string,
    code: string = 'NOT_FOUND'
  ) {
    const message = id 
      ? `${resource} with id ${id} not found` 
      : `${resource} not found`;
    super(message, code, 404);
  }
}

/**
 * Utility function to handle database operations with error handling
 * @param operation - Database operation to execute
 * @param errorMessage - Custom error message
 * @returns Result of the operation
 * @throws DatabaseError if operation fails
 */
export async function withDbErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new DatabaseError(
        errorMessage,
        error,
        'DATABASE_ERROR',
        { originalMessage: error.message }
      );
    } else {
      // Create a new Error object if error is not an Error instance
      const genericError = new Error('Unknown error occurred');
      throw new DatabaseError(
        errorMessage,
        genericError,
        'DATABASE_ERROR',
        { originalMessage: 'Unknown error' }
      );
    }
  }
}

/**
 * Express request, response, and next function types
 */
interface ExpressRequest {
  path: string;
  method: string;
  headers: Record<string, string>;
  [key: string]: any;
}

interface ExpressResponse {
  status: (code: number) => ExpressResponse;
  json: (data: any) => void;
  [key: string]: any;
}

type ExpressNextFunction = (error?: any) => void;

/**
 * Error handler middleware for Express
 * @param error - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function errorHandlerMiddleware(
  error: unknown,
  req: ExpressRequest,
  res: ExpressResponse,
  next: ExpressNextFunction
) {
  // Default error
  let statusCode = 500;
  let errorResponse = {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    details: {},
  };

  // Handle known errors
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    errorResponse = {
      code: error.code,
      message: error.message,
      details: error.details || {},
    };
  } else if (error instanceof Error) {
    errorResponse.message = error.message;
  }

  // Log error
  console.error('[ERROR]', {
    ...errorResponse,
    stack: error instanceof Error ? error.stack : 'No stack trace available',
  });

  // Send response
  res.status(statusCode).json(errorResponse);
}
