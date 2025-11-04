'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Vendor, AuthContextType, RegisterData } from '../app/types/vendor';

const VendorAuthContext = createContext<AuthContextType | undefined>(undefined);

export function VendorAuthProvider({ children }: { children: ReactNode }) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/vendors');
      if (response.ok) {
        const data = await response.json();
        setVendor(data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    const response = await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    return data;
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    setVendor(data.vendor);
    return data;
  };

  const logout = async () => {
    try {
      await fetch('/api/vendors/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setVendor(null);
      router.push('/login');
    }
  };

  const updateProfile = async (updates: Partial<Vendor>) => {
    const response = await fetch('/api/vendors', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Update failed');
    }
    setVendor(data);
    return data;
  };

  // Add the resetPassword function
  const resetPassword = async (email: string) => {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send reset email');
    }
    return data;
  };

  return (
    <VendorAuthContext.Provider
      value={{
        vendor,
        loading,
        register,
        login,
        logout,
        updateProfile,
        resetPassword, // Add this line
        isAuthenticated: !!vendor,
      }}
    >
      {children}
    </VendorAuthContext.Provider>
  );
}

export const useVendorAuth = () => {
  const context = useContext(VendorAuthContext);
  if (!context) {
    throw new Error('useVendorAuth must be used within VendorAuthProvider');
  }
  return context;
};
