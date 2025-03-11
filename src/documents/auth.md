# Authentication System Guide

## Overview
Our authentication system provides a complete solution for user authentication, session management, and security. It includes JWT handling, OAuth2 integration, and robust security measures.

## Core Authentication

### JWT Implementation
Our primary authentication uses JWT (JSON Web Tokens):

```typescript
import jwt from 'jsonwebtoken';
import { type User, type JWTPayload } from './types';

class AuthenticationService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly JWT_EXPIRES = '24h';
  
  async generateToken(user: User): Promise<string> {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
      sessionId: crypto.randomUUID()
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES,
      algorithm: 'HS256'
    });
  }

  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      await this.validateSession(decoded.sessionId);
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthError('Token has expired', 'TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthError('Invalid token', 'INVALID_TOKEN');
      }
      throw error;
    }
  }

  private async validateSession(sessionId: string): Promise<void> {
    const session = await this.sessionStore.get(sessionId);
    if (!session || session.isRevoked) {
      throw new AuthError('Session is invalid', 'INVALID_SESSION');
    }
  }
}

// Authentication middleware
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromHeader(req);
    if (!token) {
      throw new AuthError('No token provided', 'NO_TOKEN');
    }

    const auth = new AuthenticationService();
    const payload = await auth.verifyToken(token);
    
    req.user = payload;
    next();
  } catch (error) {
    handleAuthError(error, res);
  }
}

function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}
```

## OAuth2 Integration

### OAuth2 Provider Setup
Implementation for major OAuth providers:

```typescript
class OAuth2Service {
  private providers: Map<string, OAuthProvider>;

  constructor() {
    this.providers = new Map([
      ['google', new GoogleOAuthProvider()],
      ['github', new GithubOAuthProvider()],
      ['microsoft', new MicrosoftOAuthProvider()]
    ]);
  }

  async initiateOAuth(provider: string, redirectUri: string): Promise<string> {
    const oauthProvider = this.providers.get(provider);
    if (!oauthProvider) {
      throw new AuthError(`Provider ${provider} not supported`, 'INVALID_PROVIDER');
    }

    return oauthProvider.getAuthorizationUrl(redirectUri);
  }

  async handleCallback(provider: string, code: string): Promise<AuthResult> {
    const oauthProvider = this.providers.get(provider);
    if (!oauthProvider) {
      throw new AuthError(`Provider ${provider} not supported`, 'INVALID_PROVIDER');
    }

    const tokens = await oauthProvider.exchangeCode(code);
    const userInfo = await oauthProvider.getUserInfo(tokens.accessToken);
    
    // Create or update user
    const user = await this.upsertUser(userInfo);
    
    // Generate session
    const auth = new AuthenticationService();
    const token = await auth.generateToken(user);

    return { user, token };
  }

  private async upsertUser(userInfo: OAuthUserInfo): Promise<User> {
    // Implementation for user creation/update
    const existingUser = await UserModel.findOne({ 
      email: userInfo.email 
    });

    if (existingUser) {
      return this.updateUser(existingUser, userInfo);
    }

    return this.createUser(userInfo);
  }
}
```

## Session Management

### Session Store Implementation
Secure session handling with Redis:

```typescript
class SessionStore {
  private redis: Redis;
  private readonly SESSION_TTL = 24 * 60 * 60; // 24 hours

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT!),
      password: process.env.REDIS_PASSWORD
    });
  }

  async createSession(userId: string, metadata: SessionMetadata): Promise<string> {
    const sessionId = crypto.randomUUID();
    const session = {
      userId,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isRevoked: false,
      ...metadata
    };

    await this.redis.setex(
      `session:${sessionId}`,
      this.SESSION_TTL,
      JSON.stringify(session)
    );

    return sessionId;
  }

  async revokeSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.isRevoked = true;
      await this.redis.setex(
        `session:${sessionId}`,
        this.SESSION_TTL,
        JSON.stringify(session)
      );
    }
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    const sessionKeys = await this.redis.keys(`session:*`);
    for (const key of sessionKeys) {
      const session = JSON.parse(await this.redis.get(key) || '{}');
      if (session.userId === userId) {
        await this.revokeSession(key.split(':')[1]);
      }
    }
  }
}
```

## Rate Limiting

### Rate Limiter Implementation
Protection against brute force attacks:

```typescript
class RateLimiter {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async isRateLimited(key: string, limit: number, window: number): Promise<boolean> {
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, window);
    }
    
    return current > limit;
  }
}

// Rate limiting middleware
export async function rateLimiter(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  const limiter = new RateLimiter();
  const key = `rate-limit:${req.ip}`;
  
  const isLimited = await limiter.isRateLimited(key, 100, 3600);
  if (isLimited) {
    throw new AuthError('Too many requests', 'RATE_LIMITED');
  }
  
  next();
}
```

## Security Best Practices

### Password Handling
Secure password management:

```typescript
class PasswordService {
  private readonly SALT_ROUNDS = 12;

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validatePasswordStrength(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChars
    );
  }
}
```

## Error Handling

### Authentication Errors
Comprehensive error handling:

```typescript
class AuthError extends Error {
  constructor(
    message: string,
    public code: AuthErrorCode,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

function handleAuthError(error: Error, res: Response): void {
  if (error instanceof AuthError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message
      }
    });
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
} 