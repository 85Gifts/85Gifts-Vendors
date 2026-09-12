import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { config } from '@/config';

interface SessionBody {
  accessToken?: string;
  refreshToken?: string;
}

function setSessionCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  opts: {
    accessToken?: string;
    refreshToken?: string;
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
  if (opts.refreshToken) {
    cookieStore.set('refreshToken', opts.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days, mirrors backend refresh expiry
      path: '/',
    });
  }

  const vendorId = opts.vendor?._id || opts.vendor?.id;
  if (vendorId) {
    cookieStore.set('vendorId', String(vendorId), {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
  }
  if (opts.vendor?.name) {
    cookieStore.set('vendorName', String(opts.vendor.name), {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
  }
}

// The backend wraps payloads inconsistently; unwrap every known envelope.
function unwrap(data: any) {
  return data?.data?.data ?? data?.data ?? data ?? {};
}

function extractTokens(payload: any): {
  accessToken?: string;
  refreshToken?: string;
  vendor?: { _id?: string; id?: string; name?: string };
} {
  const tokens = payload?.tokens ?? payload ?? {};
  return {
    accessToken:
      tokens?.accessToken || payload?.accessToken || payload?.token || undefined,
    refreshToken:
      tokens?.refreshToken ||
      payload?.refreshToken ||
      payload?.refresh_token ||
      undefined,
    vendor: payload?.vendor,
  };
}

/**
 * Completes a vendor Google OAuth sign-in in the browser.
 *
 * The backend redirects here (via /auth/google/callback) with only a
 * `refreshToken` query param. The vendor session in this frontend runs on
 * the `accessToken` cookie, so this endpoint exchanges the refresh token
 * at the backend (POST /api/vendors/auth/refresh, Bearer auth) and
 * persists the resulting session cookies.
 *
 * If an access token is supplied directly it is stored without exchange.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as SessionBody;
  const cookieStore = await cookies();

  // 1. Direct access-token handoff — no exchange needed.
  if (body.accessToken) {
    setSessionCookies(cookieStore, { accessToken: body.accessToken });
    return NextResponse.json({ success: true });
  }

  // 2. Refresh-token exchange via the backend.
  if (body.refreshToken) {
    const backendUrl =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      config.BACKEND_URL;
    const normalized = backendUrl.replace(/\/$/, '');

    try {
      const exchange = await fetch(
        `${normalized}/api/vendors/auth/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${body.refreshToken}`,
          },
        }
      );
      const data = await exchange.json().catch(() => ({}));

      if (!exchange.ok) {
        return NextResponse.json(
          {
            success: false,
            error:
              data?.message || data?.error || 'Google login failed, please try again',
          },
          { status: 401 }
        );
      }

      const { accessToken, refreshToken, vendor } = extractTokens(
        unwrap(data)
      );

      if (!accessToken) {
        return NextResponse.json(
          { success: false, error: 'Google login did not return a session' },
          { status: 401 }
        );
      }

      // Keep the rotated refresh token when the backend returns one,
      // otherwise keep the one we were given.
      setSessionCookies(cookieStore, {
        accessToken,
        refreshToken: refreshToken || body.refreshToken,
        vendor,
      });
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json(
        { success: false, error: 'Google login failed, please try again' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { success: false, error: 'Missing session credentials' },
    { status: 400 }
  );
}
