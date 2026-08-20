'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { ADMIN_PREVIEW } from '@/lib/adminPreview';

export default function AdminRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (ADMIN_PREVIEW || loading) return;
    if (isAuthenticated && isLoginPage) {
      router.replace('/admin');
    } else if (!isAuthenticated && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [loading, isAuthenticated, isLoginPage, router]);

  if (ADMIN_PREVIEW) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <svg
            className="animate-spin h-5 w-5 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isLoginPage) return null;

  return <>{children}</>;
}