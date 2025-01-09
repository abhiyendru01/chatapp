export const TOKEN_SOURCES = {
    COOKIE: 'cookie',
    HEADER: 'header'
  };
  
  export const COOKIE_OPTIONS = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
  };