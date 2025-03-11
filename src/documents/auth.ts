export const authenticationDocs = `
# Authentication Guide

Authentication in our API is handled through JWT tokens. Here's how to implement it:

\`\`\`typescript
function authenticate(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    handleAuthError(error);
  }
}

// Example usage
app.use(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = await authenticate(token);
  req.user = user;
  next();
});
\`\`\`
`;
