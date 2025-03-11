import { codeAgent } from "./agent";

// Example: Agent choosing findCodeTool for code-specific searches
async function findCodeExample() {
  // Example 1: Finding authentication implementations
  const authResponse = await codeAgent.generate(
    "Find implementations of token verification in our authentication system"
  );
  console.log("\nAuth Implementation Search:", authResponse.text);

  // Example 2: Finding logger usage
  const loggerResponse = await codeAgent.generate(
    "Show me examples of how we use the AuditLogger class for tracking data changes"
  );
  console.log("\nLogger Usage Search:", loggerResponse.text);

  // Example 3: Finding error handling patterns
  const errorResponse = await codeAgent.generate(
    "Find examples of database error handling with our DatabaseError class"
  );
  console.log("\nError Handling Search:", errorResponse.text);
}

findCodeExample().catch(console.error);

/* Example output:
Auth Implementation Search: Found verifyToken implementation in AuthenticationService:
```typescript
async verifyToken(token: string): Promise<JWTPayload> {
  try {
    const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    await this.validateSession(decoded.sessionId);
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {...}
  }
}
```

Logger Usage Search: Found AuditLogger usage for tracking data changes:
```typescript
logDataChange(
  entity: string,
  action: 'create' | 'update' | 'delete',
  userId: string,
  before?: Record<string, unknown>,
  after?: Record<string, unknown>
) {...}
```

Error Handling Search: Found DatabaseError handling example:
```typescript
async function withDbErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {...}
```
*/
