import { useVendorAuth } from '@/contexts/VendorAuthContext';

export function useAuth() {
  const auth = useVendorAuth();

  // Refresh token disabled - no auto-refresh needed

  return auth;
}

