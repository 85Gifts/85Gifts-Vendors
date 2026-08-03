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
import { ResellerEvent } from '../app/types/reseller';

interface ResellerAuthContextType {
  email: string;
  events: ResellerEvent[];
  loading: boolean;
  authError: string;
  isAuthenticated: boolean;
  requestCode: (email: string) => Promise<any>;
  verifyCode: (email: string, code: string) => Promise<any>;
  refreshAuth: () => Promise<void>;
  getMe: () => Promise<void>;
  logout: () => Promise<void>;
}

const ResellerAuthContext = createContext<
  ResellerAuthContextType | undefined
>(undefined);

function extractErrorMessage(data: any, fallback: string): string {
  if (typeof data?.error === 'string') return data.error;
  return (
    data?.error?.message ||
    data?.message ||
    data?.errors?.[0]?.message ||
    fallback
  );
}

export function ResellerAuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState('');
  const [events, setEvents] = useState<ResellerEvent[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  const fetchMe = useCallback(async () => {
    const response = await fetch('/api/reseller/me', {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      const payload = data?.data ?? data;
      return {
        ok: true as const,
        email: payload?.email ?? '',
        events: Array.isArray(payload?.events) ? payload.events : [],
      };
    }
    if (response.status === 401) {
      return { ok: false as const, status: 401 };
    }
    throw new Error(extractErrorMessage(data, 'Failed to load profile'));
  }, []);

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/reseller/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setAuthError('');
      const result = await fetchMe();

      if (result.ok) {
        setEmail(result.email);
        setEvents(result.events);
        setAuthenticated(true);
      } else {
        const refreshed = await refreshTokens();
        if (refreshed) {
          const retry = await fetchMe();
          if (retry.ok) {
            setEmail(retry.email);
            setEvents(retry.events);
            setAuthenticated(true);
          } else {
            setEmail('');
            setEvents([]);
            setAuthenticated(false);
          }
        } else {
          setEmail('');
          setEvents([]);
          setAuthenticated(false);
        }
      }
    } catch (error: any) {
      console.error('Reseller auth check failed:', error);
      setAuthError(
        error?.message || 'Failed to verify your session'
      );
    } finally {
      setLoading(false);
    }
  }, [fetchMe, refreshTokens]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Only run the auth check on reseller dashboard pages, skip the login screen
    const isResellerPage = pathname?.startsWith('/reseller-dashboard');
    const isLoginPage = pathname?.startsWith('/reseller-dashboard/login');

    if (!isResellerPage) {
      setLoading(false);
      return;
    }
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    checkAuth();
  }, [pathname, isMounted, checkAuth]);

  const requestCode = async (emailInput: string) => {
    const response = await fetch('/api/reseller/auth/request-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: emailInput }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        extractErrorMessage(data, 'Something went wrong. Please try again.')
      );
    }
    return data;
  };

  const verifyCode = async (emailInput: string, code: string) => {
    const response = await fetch('/api/reseller/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: emailInput, code }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        extractErrorMessage(data, 'Invalid or expired code')
      );
    }
    const payload = data?.data ?? data;
    setEmail(payload?.email ?? emailInput);
    setEvents(Array.isArray(payload?.events) ? payload.events : []);
    setAuthenticated(true);
    setAuthError('');
    return data;
  };

  const refreshAuth = async () => {
    setLoading(true);
    await checkAuth();
  };

  const getMe = async () => {
    const result = await fetchMe();
    if (!result.ok) {
      throw new Error('Unable to load reseller profile');
    }
    setEmail(result.email);
    setEvents(result.events);
    setAuthenticated(true);
  };

  const logout = async () => {
    setEmail('');
    setEvents([]);
    setAuthenticated(false);
    try {
      await fetch('/api/reseller/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Reseller logout API error (continuing anyway):', error);
    }
    window.location.href = '/reseller-dashboard/login';
  };

  return (
    <ResellerAuthContext.Provider
      value={{
        email,
        events,
        loading,
        authError,
        isAuthenticated: authenticated,
        requestCode,
        verifyCode,
        refreshAuth,
        getMe,
        logout,
      }}
    >
      {children}
    </ResellerAuthContext.Provider>
  );
}

export const useResellerAuth = () => {
  const context = useContext(ResellerAuthContext);
  if (!context) {
    throw new Error(
      'useResellerAuth must be used within ResellerAuthProvider'
    );
  }
  return context;
};
