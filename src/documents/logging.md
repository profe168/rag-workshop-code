# Logging System Guide

## Overview
Our logging system provides structured logging, performance monitoring, and audit trails across the application. It supports multiple log levels, contextual logging, and integration with monitoring services.

## Core Logging System

### Logger Implementation
Base logging functionality with context and correlation:

```typescript
class Logger {
  private static instance: Logger;
  private correlationId: string;
  
  constructor(
    private context: string,
    private options: LoggerOptions = defaultOptions
  ) {
    this.correlationId = randomUUID();
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

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

  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.options.debug) {
      this.log('debug', message, meta);
    }
  }

  private log(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>
  ): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
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
      console.log(
        '\x1b[90m%s\x1b[0m',
        JSON.stringify(omit(logEntry, ['timestamp', 'level', 'context', 'message']), null, 2)
      );
    }
  }
}
```

## Request Logging

### HTTP Request Middleware
Detailed request/response logging:

```typescript
class RequestLogger {
  private logger: Logger;
  private startTime: number;

  constructor() {
    this.logger = new Logger('HTTP');
  }

  logRequest(req: Request, res: Response, next: NextFunction): void {
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

  private sanitizeHeaders(headers: IncomingHttpHeaders): Record<string, string> {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

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
```

## Performance Monitoring

### Performance Tracker
Monitor and log performance metrics:

```typescript
class PerformanceTracker {
  private static instance: PerformanceTracker;
  private logger: Logger;
  private metrics: Map<string, PerformanceMetric>;

  private constructor() {
    this.logger = new Logger('Performance');
    this.metrics = new Map();
  }

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  startOperation(name: string): string {
    const id = randomUUID();
    this.metrics.set(id, {
      name,
      startTime: performance.now(),
      metadata: {},
    });
    return id;
  }

  endOperation(id: string, metadata?: Record<string, unknown>): void {
    const metric = this.metrics.get(id);
    if (!metric) return;

    const duration = performance.now() - metric.startTime;
    
    this.logger.info(`Operation completed: ${metric.name}`, {
      operationId: id,
      duration: `${duration.toFixed(2)}ms`,
      ...metric.metadata,
      ...metadata,
    });

    this.metrics.delete(id);
  }

  async trackOperation<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const id = this.startOperation(name);
    
    try {
      const result = await operation();
      this.endOperation(id, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.endOperation(id, { 
        ...metadata, 
        success: false,
        error: error.message,
      });
      throw error;
    }
  }
}
```

## Audit Logging

### Audit Trail System
Track important system events and changes:

```typescript
class AuditLogger {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('Audit');
  }

  logAction(
    action: string,
    userId: string,
    details: Record<string, unknown>
  ): void {
    this.logger.info(`Audit: ${action}`, {
      userId,
      action,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  logDataChange(
    entity: string,
    action: 'create' | 'update' | 'delete',
    userId: string,
    before?: Record<string, unknown>,
    after?: Record<string, unknown>
  ): void {
    this.logger.info(`Data change: ${entity}`, {
      entity,
      action,
      userId,
      timestamp: new Date().toISOString(),
      changes: this.diffObjects(before, after),
    });
  }

  private diffObjects(
    before?: Record<string, unknown>,
    after?: Record<string, unknown>
  ): Record<string, { old: unknown; new: unknown }> {
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    if (!before || !after) return changes;

    const allKeys = new Set([
      ...Object.keys(before),
      ...Object.keys(after),
    ]);

    for (const key of allKeys) {
      if (before[key] !== after[key]) {
        changes[key] = {
          old: before[key],
          new: after[key],
        };
      }
    }

    return changes;
  }
}
```

## Log Aggregation

### Log Shipping
Send logs to external aggregation service:

```typescript
class LogAggregator {
  private static instance: LogAggregator;
  private readonly batchSize = 100;
  private readonly flushInterval = 5000; // 5 seconds
  private logQueue: LogEntry[] = [];
  private timer: NodeJS.Timeout;

  private constructor() {
    this.timer = setInterval(() => this.flush(), this.flushInterval);
  }

  static getInstance(): LogAggregator {
    if (!LogAggregator.instance) {
      LogAggregator.instance = new LogAggregator();
    }
    return LogAggregator.instance;
  }

  async queueLog(logEntry: LogEntry): Promise<void> {
    this.logQueue.push(logEntry);
    
    if (this.logQueue.length >= this.batchSize) {
      await this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const logs = [...this.logQueue];
    this.logQueue = [];

    try {
      await this.sendToAggregator(logs);
    } catch (error) {
      console.error('Failed to send logs to aggregator:', error);
      // Re-queue failed logs
      this.logQueue = [...logs, ...this.logQueue];
    }
  }

  private async sendToAggregator(logs: LogEntry[]): Promise<void> {
    // Implementation for sending to log aggregation service
    // (e.g., ELK, Splunk, etc.)
  }
}
``` 