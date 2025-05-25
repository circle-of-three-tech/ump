import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/auth/signin', '/auth/signup', '/'];
const authRoutes = ['/auth/signin', '/auth/signup'];

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if (token && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Require authentication for other routes
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Require verification for sensitive routes
  const sensitiveRoutes = ['/dashboard', '/listings/create', '/admin'];
  if (sensitiveRoutes.includes(pathname) && !token.isVerified) {
    return NextResponse.redirect(new URL('/profile/verify', request.url));
  }

  // Require admin role for admin routes
  if (pathname.startsWith('/admin') && !token.isAdmin) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/listings/create/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/auth/:path*',
  ],
};
