import { auth } from './lib/auth';

export default auth((req) => {
  // Protection middleware (automatically handled by NextAuth)
});

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
