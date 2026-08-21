import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RESELLER_ACCESS_TOKEN_COOKIE } from '@/lib/reseller-constants';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/products'];

  const isProtectedRoute =
    protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const accessToken = request.cookies.get('accessToken');

    if (!accessToken) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Reseller dashboard is protected, except the login screen
  if (pathname.startsWith('/reseller-dashboard') && !pathname.startsWith('/reseller-dashboard/login')) {
    const resellerToken = request.cookies.get(RESELLER_ACCESS_TOKEN_COOKIE);

    if (!resellerToken) {
      const loginUrl = new URL('/reseller-dashboard/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Admin dashboard is protected, except the login screen.
  // Disabled while NEXT_PUBLIC_ADMIN_PREVIEW is enabled (preview mode).
  const isAdminPreview = process.env.NEXT_PUBLIC_ADMIN_PREVIEW === 'true';
  if (
    pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin/login') &&
    !isAdminPreview
  ) {
    const adminToken = request.cookies.get('adminAccessToken');

    if (!adminToken) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

