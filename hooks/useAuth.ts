import { useEffect } from 'react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';

export function useAuth() {
  const auth = useVendorAuth();

  useEffect(() => {
    // Auto refresh token every 45 minutes (tokens expire in 1 hour)
    const refreshInterval = setInterval(async () => {
      try {
        await fetch('/api/vendors/refresh-tokens', { method: 'POST' });
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, 45 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  return auth;
}

