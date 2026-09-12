import { NextResponse } from 'next/server';
import { config } from '@/config';

/**
 * Initiates vendor Google OAuth.
 * Redirects the browser to the backend's Google consent entry point:
 *   GET {BACKEND}/api/vendors/auth/google -> 302 to accounts.google.com
 *
 * Keeping this server-side avoids exposing the backend URL in client code
 * and lets us use API_URL / NEXT_PUBLIC_API_URL env config.
 */
export async function GET() {
  const backendUrl =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    config.BACKEND_URL;

  const normalized = backendUrl.replace(/\/$/, '');
  return NextResponse.redirect(`${normalized}/api/vendors/auth/google`);
}
