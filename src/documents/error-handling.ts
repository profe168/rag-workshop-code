export const errorHandlingDocs = `
# Error Handling Best Practices

## Database Errors
When handling database operations, always use try/catch:

\`\`\`typescript
async function queryUsers() {
  try {
    const result = await db.query('SELECT * FROM users');
    return result.rows;
  } catch (error) {
    logger.error('Database query failed:', error);
    throw new DatabaseError('Failed to fetch users');
  }
}
\`\`\`

## Input Validation
Always validate user input:

\`\`\`typescript
function validateUserInput(data: unknown): User {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid input');
  }
  
  // More validation logic...
  return data as User;
}
\`\`\`
`;
