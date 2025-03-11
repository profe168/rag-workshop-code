export const loggingDocs = `
# Logging System

Our logging system uses a custom Logger class:

\`\`\`typescript
class Logger {
  constructor(private context: string) {}

  info(message: string, meta?: object) {
    console.log(\`[INFO] [\${this.context}]: \${message}\`, meta);
  }

  error(message: string, error: Error) {
    console.error(\`[ERROR] [\${this.context}]: \${message}\`, error);
  }
}

// Usage examples
const logger = new Logger('UserService');
logger.info('User created', { userId: 123 });
logger.error('Failed to update user', new Error('Database connection failed'));
\`\`\`
`;
