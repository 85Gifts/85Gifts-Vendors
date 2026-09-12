import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RESELLER_ACCESS_TOKEN_COOKIE } from '@/lib/reseller-constants';

// Paths where a bare `?token=` belongs to another flow (password reset,
// email verification) and must NOT be treated as an OAuth session token.
const OAUTH_TOKEN_EXCLUDED_PATHS = [
  '/reset-password',
  '/verify-email',
  '/verifyEmail',
];

// Query params the backend may use when handing an OAuth session back to us.
const OAUTH_TOKEN_PARAMS = ['accessToken', 'access_token', 'token'];
const OAUTH_VENDOR_PARAMS = [
  'vendor',
  'vendorId',
  'id',
  'vendorName',
  'name',
];

function parseVendorParam(params: URLSearchParams): {
  vendorId?: string;
  vendorName?: string;
} {
  const raw = params.get('vendor');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const vendorId = parsed?._id || parsed?.id;
      if (vendorId || parsed?.name) {
        return {
          vendorId: vendorId ? String(vendorId) : undefined,
          vendorName: parsed?.name ? String(parsed.name) : undefined,
        };
      }
    } catch {
      // Fall through to the individual params below.
    }
  }
  const vendorId = params.get('vendorId') || params.get('id') || undefined;
  const vendorName =
    params.get('vendorName') || params.get('name') || undefined;
  return {
    vendorId: vendorId || undefined,
    vendorName: vendorName || undefined,
  };
}

/**
 * Google OAuth safety net.
 *
 * The backend finishes Google consent on its own domain and then redirects
 * back to this frontend. Depending on backend config it may land on the
 * dedicated `/api/auth/google/callback` route — or directly on a page such
 * as `/dashboard?accessToken=...` or `/login?token=...`.
 *
 * In the direct-to-page case no cookies are ever set, so the protected-route
 * check below bounces `/dashboard` straight back to `/login` and the token
 * in the URL is lost — the "login loops back to login" symptom.
 *
 * To stay working regardless of which landing URL the backend uses, capture
 * an OAuth session token from the query string here, persist it as cookies,
 * strip it from the URL, and send the user to `/dashboard`.
 *
 * Returns a redirect response when it handled the request, else null.
 */
function captureOAuthSession(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  if (
    OAUTH_TOKEN_EXCLUDED_PATHS.some((route) => pathname.startsWith(route))
  ) {
    return null;
  }

  const params = request.nextUrl.searchParams;

  // An explicit `accessToken`/`access_token` is unambiguous anywhere.
  // A bare `token` is only trusted on the login/dashboard/landing pages so
  // flows like password reset (`/reset-password?token=...`) are untouched.
  const accessToken =
    params.get('accessToken') || params.get('access_token') || undefined;
  const genericToken =
    pathname === '/login' || pathname === '/dashboard' || pathname === '/'
      ? params.get('token') || undefined
      : undefined;
  const token = accessToken || genericToken;

  if (!token) return null;

  const { vendorId, vendorName } = parseVendorParam(params);

  const url = request.nextUrl.clone();
  for (const key of [
    ...OAUTH_TOKEN_PARAMS,
    ...OAUTH_VENDOR_PARAMS,
    'error',
    'message',
  ]) {
    url.searchParams.delete(key);
  }
  // Token-bearing landings on login (or /) are post-OAuth successes.
  if (url.pathname === '/login' || url.pathname === '/') {
    url.pathname = '/dashboard';
  }

  const response = NextResponse.redirect(url);
  const isProd = process.env.NODE_ENV === 'production';

  response.cookies.set('accessToken', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour, mirrors /api/login
    path: '/',
  });
  if (vendorId) {
    response.cookies.set('vendorId', vendorId, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
  }
  if (vendorName) {
    response.cookies.set('vendorName', vendorName, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
  }
  return response;
}

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Capture OAuth sessions handed back via query params before anything
  // else (in particular before the protected-route bounce to /login).
  const oauthResponse = captureOAuthSession(request);
  if (oauthResponse) return oauthResponse;
  
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

