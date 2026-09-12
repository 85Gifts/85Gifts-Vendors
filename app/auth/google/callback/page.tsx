'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const upstreamError =
      searchParams.get('error') || searchParams.get('message');
    const accessToken =
      searchParams.get('accessToken') ||
      searchParams.get('access_token') ||
      searchParams.get('token') ||
      undefined;
    const refreshToken = searchParams.get('refreshToken') || undefined;

    if (!accessToken && !refreshToken) {
      setError(
        upstreamError
          ? decodeURIComponent(upstreamError)
          : 'Google login failed, please try again'
      );
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/auth/google/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ accessToken, refreshToken }),
        });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (response.ok && data?.success !== false) {
          router.replace('/dashboard');
        } else {
          setError(data?.error || 'Google login failed, please try again');
        }
      } catch {
        if (!cancelled) {
          setError('Google login failed, please try again');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-background">
        <div className="w-full max-w-md text-center">
          <Card className="rounded-2xl shadow-xl border-border">
            <CardContent className="p-8 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <ShieldAlert className="h-6 w-6 text-destructive" />
              </div>
              <h1 className="text-xl font-bold text-foreground">
                Google sign-in failed
              </h1>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button asChild className="w-full" size="lg">
                <Link href="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-background">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm">Completing Google sign-in…</span>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-background">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm">Completing Google sign-in…</span>
          </div>
        </div>
      }
    >
      <GoogleCallbackInner />
    </Suspense>
  );
}
