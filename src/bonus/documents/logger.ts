/**
 * Logging System Implementation
 * Provides structured logging with context and correlation IDs
 */
import { randomUUID } from 'crypto';

// Log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Logger options
interface LoggerOptions {
  debug: boolean;
  remote: boolean;
  service: string;
  environment: string;
}

// Log entry structure
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  correlationId: string;
  message: string;
  [key: string]: unknown;
}

// Default logger options
const defaultOptions: LoggerOptions = {
  debug: process.env.NODE_ENV === 'development',
  remote: process.env.NODE_ENV === 'production',
  service: process.env.SERVICE_NAME || 'app',
  environment: process.env.NODE_ENV || 'development',
};

/**
 * Main Logger class
 * Handles structured logging with context and correlation IDs
 */
export class Logger {
  private static instance: Logger;
  private correlationId: string;
  
  constructor(
    private context: string,
    private options: LoggerOptions = defaultOptions
  ) {
    this.correlationId = randomUUID();
  }

  /**
   * Get singleton instance
   * @param context - Logging context
   * @param options - Logger options
   * @returns Logger instance
   */
  static getInstance(context: string, options?: LoggerOptions): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(context, options);
    }
    return Logger.instance;
  }

  /**
   * Log an info message
   * @param message - Log message
   * @param meta - Additional metadata
   */
  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  /**
   * Log a warning message
   * @param message - Log message
   * @param meta - Additional metadata
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

  /**
   * Log an error message
   * @param message - Log message
   * @param error - Error object
   * @param meta - Additional metadata
   */
  error(message: string, error: Error, meta?: Record<string, unknown>): void {
    this.log('error', message, {
      ...meta,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
      },
    });
  }

  /**
   * Log a debug message (only in debug mode)
   * @param message - Log message
   * @param meta - Additional metadata
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.options.debug) {
      this.log('debug', message, meta);
    }
  }

  /**
   * Internal logging method
   * @param level - Log level
   * @param message - Log message
   * @param meta - Additional metadata
   */
  private log(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>
  ): void {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      context: this.context,
      correlationId: this.correlationId,
      message,
      ...meta,
    };

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      this.prettyPrint(logEntry);
    } else {
      // JSON output for production (easier to parse)
      console.log(JSON.stringify(logEntry));
    }

    // Send to log aggregation service if configured
    if (this.options.remote) {
      this.sendToLogAggregator(logEntry);
    }
  }

  /**
   * Pretty print log entry for development
   * @param logEntry - Log entry to print
   */
  private prettyPrint(logEntry: LogEntry): void {
    const colors = {
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
      debug: '\x1b[36m', // Cyan
    };

    const color = colors[logEntry.level] || '\x1b[0m';
    console.log(
      `${color}[${logEntry.timestamp}] [${logEntry.level.toUpperCase()}] ` +
      `[${logEntry.context}] ${logEntry.message}\x1b[0m`
    );
    
    if (Object.keys(logEntry).length > 5) {
      const metadata: Partial<LogEntry> & Record<string, unknown> = { ...logEntry };
      if ('timestamp' in metadata) metadata.timestamp = undefined;
      if ('level' in metadata) metadata.level = undefined;
      if ('context' in metadata) metadata.context = undefined;
      if ('message' in metadata) metadata.message = undefined;
      
      console.log('\x1b[90m%s\x1b[0m', JSON.stringify(metadata, null, 2));
    }
  }

  /**
   * Send log entry to remote log aggregator
   * @param logEntry - Log entry to send
   */
  private sendToLogAggregator(logEntry: LogEntry): void {
    // Implementation would depend on the log aggregation service
    // This is a placeholder for actual implementation
    try {
      // Example: send to Elasticsearch, CloudWatch, etc.
      console.log(`[REMOTE LOG] Would send to log aggregator: ${JSON.stringify(logEntry)}`);
    } catch (error) {
      console.error('Failed to send log to aggregator:', error);
    }
  }
}

/**
 * Audit Logger for tracking data changes
 * Extends the base Logger with audit-specific methods
 */
export class AuditLogger extends Logger {
  constructor() {
    super('AUDIT');
  }

  /**
   * Log a data change event
   * @param entity - Entity type (e.g., 'user', 'product')
   * @param action - Action performed (create, update, delete)
   * @param userId - ID of user who performed the action
   * @param before - Entity state before change
   * @param after - Entity state after change
   */
  logDataChange(
    entity: string,
    action: 'create' | 'update' | 'delete',
    userId: string,
    before?: Record<string, unknown>,
    after?: Record<string, unknown>
  ): void {
    this.info(`${action.toUpperCase()} ${entity}`, {
      entity,
      action,
      userId,
      before,
      after,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log a security event
   * @param event - Security event type
   * @param userId - ID of user involved
   * @param details - Additional details
   */
  logSecurityEvent(
    event: 'login' | 'logout' | 'password_change' | 'permission_change' | 'access_denied',
    userId: string,
    details?: Record<string, unknown>
  ): void {
    this.info(`SECURITY EVENT: ${event}`, {
      event,
      userId,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Express request, response, and next function types
 */
interface ExpressRequest {
  headers: Record<string, string>;
  method: string;
  url: string;
  params: Record<string, string>;
  query: Record<string, string>;
  body: any;
  ip: string;
  requestId?: string;
  [key: string]: any;
}

interface ExpressResponse {
  statusCode: number;
  on(event: string, callback: () => void): void;
  get(header: string): string | undefined;
  [key: string]: any;
}

type ExpressNextFunction = (error?: any) => void;

/**
 * Request logger middleware for HTTP requests
 */
export class RequestLogger {
  private logger: Logger;
  private startTime: number = 0;

  constructor() {
    this.logger = new Logger('HTTP');
  }

  /**
   * Log an incoming HTTP request
   * @param req - HTTP request
   * @param res - HTTP response
   * @param next - Next middleware function
   */
  logRequest(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction): void {
    this.startTime = performance.now();

    // Generate request ID
    const requestId = req.headers['x-request-id'] || randomUUID();
    req.requestId = requestId;

    // Log request
    this.logger.info('Incoming request', {
      requestId,
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      headers: this.sanitizeHeaders(req.headers),
      body: this.sanitizeBody(req.body),
      ip: req.ip,
    });

    // Log response
    res.on('finish', () => {
      const duration = performance.now() - this.startTime;
      
      this.logger.info('Request completed', {
        requestId,
        statusCode: res.statusCode,
        duration: `${duration.toFixed(2)}ms`,
        contentLength: res.get('Content-Length'),
      });
    });

    next();
  }

  /**
   * Sanitize headers to remove sensitive information
   * @param headers - HTTP headers
   * @returns Sanitized headers
   */
  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  /**
   * Sanitize request body to remove sensitive information
   * @param body - Request body
   * @returns Sanitized body
   */
  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
}
