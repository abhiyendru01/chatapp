import { TOKEN_SOURCES } from '../lib/constants.js';

export const extractToken = (req) => {
  // Log headers and cookies for debugging
  console.log('Cookies:', req.cookies);
  console.log('Headers:', req.headers);

  // Check for JWT in cookies
  if (req.cookies?.jwt) {
    return { token: req.cookies.jwt, source: TOKEN_SOURCES.COOKIE };
  }
  
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return { 
      token: authHeader.split(' ')[1],
      source: TOKEN_SOURCES.HEADER 
    };
  }
  
  return { token: null, source: null };
};