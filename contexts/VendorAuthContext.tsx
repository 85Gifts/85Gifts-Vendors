'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Vendor, AuthContextType, RegisterData } from '../app/types/vendor';
import { apiClient, ApiError } from '../lib/api';

const VendorAuthContext = createContext<AuthContextType | undefined>(undefined);

export function VendorAuthProvider({ children }: { children: ReactNode }) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string>("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check on login/register/auth pages and public pages
    const isAuthPage = pathname === '/login' || 
                       pathname === '/register' || 
                       pathname?.startsWith('/reset-password') || 
                       pathname?.startsWith('/verify-email');
    
    // Public routes that don't require authentication
    const isPublicRoute = pathname?.startsWith('/event/') || 
                         pathname === '/' ||
                         pathname?.startsWith('/booking-success') ||
                         pathname?.startsWith('/inventory/');
    
    if (!isAuthPage && !isPublicRoute) {
      checkAuth();
    } else {
      // On auth pages and public routes, just set loading to false
      setLoading(false);
    }
  }, [pathname]);

  const checkAuth = async () => {
    try {
      setAuthError("");
      const data = await apiClient('/api/profile');
      setVendor(data);
      
      // Save vendor _id and name to localStorage on auth check
      const vendorId = data._id || data.id;
      if (vendorId) {
        localStorage.setItem('vendorId', vendorId);
      }
      if (data.name) {
        localStorage.setItem('vendorName', data.name);
      }
    } catch (error: any) {
      const apiError = error as ApiError;
      console.error('Auth check failed:', error);
      if (apiError.status === 401 || apiError.status === 403) {
        setVendor(null);
        // Clear vendor data from localStorage if not authenticated
        localStorage.removeItem('vendorId');
        localStorage.removeItem('vendorName');
      } else {
        setAuthError(apiError.message || "Auth check failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    setLoading(true);
    await checkAuth();
  };

  const register = async (userData: RegisterData) => {
    const data = await apiClient('/api/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return data;
  };

  const login = async (email: string, password: string) => {
    const data = await apiClient('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // The API route returns { success: true, vendor: {...}, message: '...' }
    if (data.vendor) {
      setVendor(data.vendor);
      
      // Save vendor _id and name to localStorage
      const vendorId = data.vendor._id || data.vendor.id;
      if (vendorId) {
        localStorage.setItem('vendorId', vendorId);
      }
      if (data.vendor.name) {
        localStorage.setItem('vendorName', data.vendor.name);
      }
    }
    return data;
  };

  const logout = async () => {
    console.log('🔴 LOGOUT CALLED - Starting logout process...');
    
    // Clear vendor state
    setVendor(null);
    console.log('✓ Vendor state cleared');
    
    // Clear all localStorage
    localStorage.removeItem('vendorId');
    localStorage.removeItem('vendorName');
    console.log('✓ localStorage cleared');
    
    // Clear all client-accessible cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    console.log('✓ Client cookies cleared');
    
    // Call logout API to clear HttpOnly cookies on server
    try {
      console.log('🔄 Calling logout API to clear HttpOnly cookies...');
      await fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include' 
      });
      console.log('✓ Server cookies cleared');
    } catch (error) {
      console.error('Logout API error (continuing anyway):', error);
    }
    
    console.log('🔄 Redirecting to /login...');
    // Hard redirect to login page
    window.location.href = '/login';
  };

  const updateProfile = async (updates: Partial<Vendor>) => {
    const data = await apiClient('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    // Update vendor state with the updated data
    if (data) {
      setVendor(data);
    }
    return data;
  };

  // Forgot password (sends reset email)
  const forgotPassword = async (email: string) => {
    const data = await apiClient('/api/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return data;
  };

  return (
    <VendorAuthContext.Provider
      value={{
        vendor,
        loading,
        authError,
        register,
        login,
        logout,
        updateProfile,
        forgotPassword, // Add this line
        refreshAuth,
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
