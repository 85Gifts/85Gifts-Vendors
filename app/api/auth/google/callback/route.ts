import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { config } from '@/config';

function getBaseUrl(request: NextRequest) {
  // Prefer explicit site URL env, fall back to request origin.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    request.nextUrl.origin;
  return siteUrl.replace(/\/$/, '');
}

function setAuthCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  opts: {
    accessToken?: string;
    vendor?: { _id?: string; id?: string; name?: string };
  }
) {
  const isProd = process.env.NODE_ENV === 'production';

  if (opts.accessToken) {
    cookieStore.set('accessToken', opts.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour, mirrors /api/login
      path: '/',
    });
  }

  const vendorId = opts.vendor?._id || opts.vendor?.id;
  if (vendorId) {
    cookieStore.set('vendorId', vendorId, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
  }
  if (opts.vendor?.name) {
    cookieStore.set('vendorName', opts.vendor.name, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
  }
}

function failRedirect(request: NextRequest, message: string) {
  const base = getBaseUrl(request);
  return NextResponse.redirect(
    `${base}/login?error=${encodeURIComponent(message)}`
  );
}

/**
 * Google OAuth callback landing spot for the vendor frontend.
 *
 * The backend (passport OAuth2) finishes Google consent at
 * /api/vendors/auth/google/callback on its own domain and then redirects
 * here (or directly to /dashboard / /login) with one of:
 *   ?accessToken=... (&vendorId / &vendorName, or &vendor=<json>)
 *   ?token=... / ?access_token=...
 *   ?code=... (then we exchange server-side with the backend)
 *   ?error=...
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const base = getBaseUrl(request);

  const upstreamError =
    params.get('error') ||
    params.get('message');
  // ?error=access_denied from Google itself should surface, not loop.
  if (upstreamError && !params.get('accessToken') && !params.get('token') && !params.get('code')) {
    return failRedirect(request, upstreamError);
  }

  // 1. Direct token handoff (most common for cross-domain OAuth).
  const accessToken =
    params.get('accessToken') ||
    params.get('access_token') ||
    params.get('token') ||
    undefined;

  if (accessToken) {
    let vendor: { _id?: string; id?: string; name?: string } | undefined;
    const vendorRaw = params.get('vendor');
    if (vendorRaw) {
      try {
        vendor = JSON.parse(vendorRaw);
      } catch {
        vendor = undefined;
      }
    }
    if (!vendor) {
      const vendorId = params.get('vendorId') || params.get('id') || undefined;
      const vendorName = params.get('vendorName') || params.get('name') || undefined;
      if (vendorId || vendorName) {
        vendor = { _id: vendorId, name: vendorName };
      }
    }

    const cookieStore = await cookies();
    setAuthCookies(cookieStore, { accessToken, vendor });
    return NextResponse.redirect(`${base}/dashboard`);
  }

  // 2. Code exchange: backend trades ?code= for tokens server-to-server.
  const code = params.get('code');
  if (code) {
    const backendUrl =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      config.BACKEND_URL;
    const normalized = backendUrl.replace(/\/$/, '');

    try {
      const exchange = await fetch(
        `${normalized}/api/vendors/auth/google/callback?code=${encodeURIComponent(code)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const data = await exchange.json().catch(() => ({}));

      if (!exchange.ok) {
        return failRedirect(
          request,
          data?.error?.message || data?.message || 'Google login failed'
        );
      }

      const payload = data?.data?.data ?? data?.data ?? data;
      const exchangedToken =
        payload?.tokens?.accessToken ||
        payload?.accessToken ||
        payload?.token;
      const exchangedVendor = payload?.vendor;

      if (!exchangedToken) {
        return failRedirect(request, 'Google login did not return a session');
      }

      const cookieStore = await cookies();
      setAuthCookies(cookieStore, {
        accessToken: exchangedToken,
        vendor: exchangedVendor,
      });
      return NextResponse.redirect(`${base}/dashboard`);
    } catch {
      return failRedirect(request, 'Google login failed, please try again');
    }
  }

  return failRedirect(request, 'Google login failed, please try again');
}
