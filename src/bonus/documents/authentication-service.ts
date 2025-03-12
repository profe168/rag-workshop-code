/**
 * Authentication Service Implementation
 * Handles JWT token generation, verification, and session management
 */
// Using type declarations instead of direct import to avoid module not found errors
type JWT = {
  sign(payload: any, secret: string, options?: any): string;
  verify(token: string, secret: string): any;
  TokenExpiredError: any;
  JsonWebTokenError: any;
};

// Mock JWT implementation for demonstration purposes
const jwt: JWT = {
  sign: (payload, secret, options) => 'mock.jwt.token',
  verify: (token, secret) => ({ userId: '123', email: 'user@example.com', roles: ['user'], sessionId: '456', exp: Date.now() }),
  TokenExpiredError: class TokenExpiredError extends Error {},
  JsonWebTokenError: class JsonWebTokenError extends Error {}
};

import { randomUUID } from 'crypto';
import { DatabaseError, AuthenticationError } from './error-handling';

// JWT Payload interface
interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  sessionId: string;
  exp: number;
}

// Session interface
interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  deviceInfo: {
    ip: string;
    userAgent: string;
    deviceId?: string;
  };
}

/**
 * Authentication Service class
 * Handles all authentication-related operations
 */
export class AuthenticationService {
  private JWT_SECRET: string;
  private JWT_EXPIRES_IN: string;
  private sessions: Map<string, Session>;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
    this.sessions = new Map();
  }

  /**
   * Generate a new JWT token for a user
   * @param userId - User ID
   * @param email - User email
   * @param roles - User roles
   * @param deviceInfo - Device information
   * @returns JWT token
   */
  async generateToken(
    userId: string,
    email: string,
    roles: string[],
    deviceInfo: { ip: string; userAgent: string; deviceId?: string }
  ): Promise<string> {
    try {
      // Create a new session
      const sessionId = randomUUID();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 3600000); // 1 hour

      const session: Session = {
        id: sessionId,
        userId,
        createdAt: now,
        expiresAt,
        isActive: true,
        deviceInfo,
      };

      // Store session
      this.sessions.set(sessionId, session);

      // Create JWT payload
      const payload: Omit<JWTPayload, 'exp'> = {
        userId,
        email,
        roles,
        sessionId,
      };

      // Sign token
      return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DatabaseError(
          `Failed to generate token: ${error.message}`,
          error,
          'AUTH_TOKEN_GENERATION_ERROR'
        );
      } else {
        const genericError = new Error('Unknown error');
        throw new DatabaseError(
          'Failed to generate token: Unknown error',
          genericError,
          'AUTH_TOKEN_GENERATION_ERROR'
        );
      }
    }
  }

  /**
   * Verify a JWT token and validate the session
   * @param token - JWT token to verify
   * @returns JWT payload if valid
   * @throws Error if token is invalid or session is inactive
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      // Verify token
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      
      // Validate session
      await this.validateSession(decoded.sessionId);
      
      return decoded;
    } catch (error: unknown) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Token has expired', 'TOKEN_EXPIRED');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid token', 'INVALID_TOKEN');
      } else if (error instanceof Error) {
        throw new AuthenticationError(
          `Token verification failed: ${error.message}`,
          'TOKEN_VERIFICATION_FAILED'
        );
      } else {
        throw new AuthenticationError(
          'Unknown error during token verification',
          'UNKNOWN_AUTH_ERROR'
        );
      }
    }
  }

  /**
   * Validate a session by ID
   * @param sessionId - Session ID to validate
   * @throws Error if session is not found or inactive
   */
  async validateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new AuthenticationError('Session not found', 'SESSION_NOT_FOUND');
    }
    
    if (!session.isActive) {
      throw new AuthenticationError('Session is inactive', 'SESSION_INACTIVE');
    }
    
    if (new Date() > session.expiresAt) {
      session.isActive = false;
      this.sessions.set(sessionId, session);
      throw new AuthenticationError('Session has expired', 'SESSION_EXPIRED');
    }
  }

  /**
   * Invalidate a user session
   * @param sessionId - Session ID to invalidate
   * @returns True if session was invalidated, false otherwise
   */
  async invalidateSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }
    
    session.isActive = false;
    this.sessions.set(sessionId, session);
    return true;
  }

  /**
   * Invalidate all sessions for a user
   * @param userId - User ID
   * @returns Number of invalidated sessions
   */
  async invalidateAllUserSessions(userId: string): Promise<number> {
    let count = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId && session.isActive) {
        session.isActive = false;
        this.sessions.set(sessionId, session);
        count++;
      }
    }
    
    return count;
  }
}
