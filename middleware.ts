export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    // Protected routes
    '/account/:path*',
    '/admin/:path*',
    '/api/balance',
    '/api/account',
    '/api/admin/:path*',
    '/api/packages',
    '/api/paypal/:path*',
  ],
};
