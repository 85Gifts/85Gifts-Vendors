import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { config } from '@/config';

interface SessionBody {
  accessToken?: string;
  refreshToken?: string;
  vendor?: { _id?: string; id?: string; name?: string } | string;
}

function parseVendorParam(raw: SessionBody['vendor']): {
  _id?: string;
  id?: string;
  name?: string;
} | undefined {
  if (!raw) return undefined;
  if (typeof raw === 'object') return raw;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    // Not JSON — ignore.
  }
  return undefined;
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

// Backend error envelopes carry the message at different spots — and may
// nest it inside an object (which can even contain a stack trace, so never
// forward `error` itself, only its message string).
function extractErrorMessage(data: any, fallback: string): string {
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;
  if (typeof data?.error?.message === 'string') return data.error.message;
  return fallback;
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
 * The backend redirects here (via /auth/google/callback) with
 * `?accessToken=...&refreshToken=...&vendor=...`. The vendor session in
 * this frontend runs on the `accessToken` cookie:
 *
 * - access token present  -> stored directly, no exchange needed.
 * - only refresh token    -> exchanged at the backend's refresh endpoint
 *   (POST /api/vendors/refresh-tokens, JSON body { refreshToken }) and
 *   the resulting session cookies are persisted.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as SessionBody;
  const cookieStore = await cookies();
  const queryVendor = parseVendorParam(body.vendor);

  // 1. Direct access-token handoff — no exchange needed.
  if (body.accessToken) {
    setSessionCookies(cookieStore, {
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
      vendor: queryVendor,
    });
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
        `${normalized}/api/vendors/refresh-tokens`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: body.refreshToken }),
        }
      );
      const data = await exchange.json().catch(() => ({}));

      if (!exchange.ok) {
        return NextResponse.json(
          {
            success: false,
            error: extractErrorMessage(
              data,
              'Google login failed, please try again'
            ),
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
      // otherwise keep the one we were given. Vendor details come from
      // the exchange payload, falling back to the callback query param.
      setSessionCookies(cookieStore, {
        accessToken,
        refreshToken: refreshToken || body.refreshToken,
        vendor: vendor || queryVendor,
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
