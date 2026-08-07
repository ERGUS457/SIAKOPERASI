import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

export default NextAuth(authConfig).auth((req) => {
  const isAuth = !!req.auth;
  const isDashboardPage = req.nextUrl.pathname.startsWith('/dashboard');

  console.log(`[Middleware] Path: ${req.nextUrl.pathname}, isAuth: ${isAuth}`);

  if (isDashboardPage && !isAuth) {
    console.log(`[Middleware] Redirecting to login. req.auth:`, req.auth);
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*']
};
