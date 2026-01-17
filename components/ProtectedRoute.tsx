'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVendorAuth } from '@/contexts/VendorAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, authError, refreshAuth } = useVendorAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated && !authError) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, authError, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-3">
            <div className="text-lg">We couldn't verify your session.</div>
            <div className="text-sm text-gray-500">{authError}</div>
            <button
              onClick={() => refreshAuth?.()}
              className="mt-2 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-black text-white hover:bg-gray-900"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
}
