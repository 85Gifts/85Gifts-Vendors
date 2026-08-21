'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { AdminUser } from '../app/types/admin';
import { ADMIN_PREVIEW, previewAdminUser } from '@/lib/adminPreview';

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  authError: string;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

function extractErrorMessage(data: any, fallback: string): string {
  if (typeof data?.error === 'string') return data.error;
  return (
    data?.error?.message ||
    data?.message ||
    data?.errors?.[0]?.message ||
    fallback
  );
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setAuthError('');
      if (ADMIN_PREVIEW) {
        setAdmin(previewAdminUser);
        setAuthenticated(true);
        return;
      }
      const response = await fetch('/api/admin/me', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const payloadAdmin = data?.data?.admin ?? data?.admin;
        setAdmin(payloadAdmin ?? null);
        setAuthenticated(Boolean(payloadAdmin?._id));
      } else {
        setAdmin(null);
        setAuthenticated(false);
      }
    } catch (error: any) {
      console.error('Admin auth check failed:', error);
      setAdmin(null);
      setAuthenticated(false);
      setAuthError(error?.message || 'Failed to verify your session');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const isAdminPage = pathname?.startsWith('/admin');
    const isLoginPage = pathname === '/admin/login';

    if (!isAdminPage) {
      setLoading(false);
      return;
    }
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    checkAuth();
  }, [pathname, isMounted, checkAuth]);

  const login = async (email: string, password: string) => {
    setAuthError('');
    if (ADMIN_PREVIEW) {
      setAdmin(previewAdminUser);
      setAuthenticated(true);
      return { success: true, data: { admin: previewAdminUser } };
    }
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(data, 'Invalid credentials. Please try again.')
      );
    }

    const payloadAdmin = data?.data?.admin ?? data?.admin;
    setAdmin(payloadAdmin ?? null);
    setAuthenticated(Boolean(payloadAdmin?._id));
    setAuthError('');
    return data;
  };

  const refreshAuth = async () => {
    setLoading(true);
    await checkAuth();
  };

  const logout = async () => {
    setAdmin(null);
    setAuthenticated(false);
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Admin logout API error (continuing anyway):', error);
    }
    window.location.href = '/admin/login';
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        authError,
        isAuthenticated: authenticated,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};