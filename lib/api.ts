import { redirectToLogin } from "@/lib/authRedirect"

export type ApiError = Error & { status?: number }

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiClient(
  endpoint: string, 
  options: FetchOptions = {}
) {
  const { requiresAuth = false, ...fetchOptions } = options;

  // Check for dev mode bypass - also check for localhost as fallback
  const isDevMode = (
    (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true') ||
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
  );
  
  console.log('[API] Dev mode check:', { 
    NODE_ENV: process.env.NODE_ENV, 
    BYPASS: process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH,
    isDevMode 
  });
  
  if (isDevMode) {
    // Return mock data for different endpoints
    return getMockData(endpoint, options);
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: 'include', // Include cookies in requests
  };

  let response: Response;
  try {
    response = await fetch(endpoint, config);
  } catch (error: any) {
    const networkError: ApiError = new Error(error?.message || 'Network error');
    networkError.status = 0;
    throw networkError;
  }
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    redirectToLogin()
    const unauthorizedError: ApiError = new Error('Invalid credentials');
    unauthorizedError.status = response.status;
    throw unauthorizedError;
  }

  if (!response.ok) {
    // Safely extract error message from various possible formats
    const errorMessage = 
      data?.error?.message || 
      (typeof data?.error === 'string' ? data.error : null) ||
      data?.message || 
      data?.detail ||
      'API request failed';
    const apiError: ApiError = new Error(errorMessage);
    apiError.status = response.status;
    throw apiError;
  }

  return data;
}

// Mock data function for dev mode bypass
function getMockData(endpoint: string, options: FetchOptions = {}) {
  const mockVendor = {
    id: 'dev-vendor-id',
    name: 'Dev User',
    email: 'dev@example.com',
    role: 'vendor',
    isEmailVerified: true,
    businessName: 'Dev Business',
    address: '123 Dev Street',
    phone: '555-DEV-TEST'
  };

  const mockEvent = {
    _id: 'dev-event-id',
    id: 'dev-event-id',
    title: 'Dev Event',
    description: 'Mock event for development',
    date: new Date().toISOString(),
    location: 'Dev Location',
    vendorId: 'dev-vendor-id'
  };

  switch (endpoint) {
    case '/api/profile':
      return mockVendor;
    
    case '/api/vendor/wallet':
      return {
        balance: 1000.00,
        currency: 'USD',
        lastUpdated: new Date().toISOString()
      };
    
    case '/api/vendor/wallet/transactions':
      return {
        transactions: [
          {
            id: '1',
            type: 'credit',
            amount: 500.00,
            description: 'Mock transaction 1',
            date: new Date().toISOString()
          },
          {
            id: '2', 
            type: 'debit',
            amount: -50.00,
            description: 'Mock transaction 2',
            date: new Date(Date.now() - 86400000).toISOString()
          }
        ],
        total: 2,
        page: 1,
        limit: 10
      };
    
    case '/api/events':
      return [mockEvent];
    
    case '/api/events/dev-event-id':
      return mockEvent;
    
    default:
      // Default mock response
      return { success: true, message: 'Dev mode mock response' };
  }
}

// Vendor API functions
export const vendorApi = {
  register: (userData: { name: string; email: string; password: string }) =>
    apiClient('/api/vendors/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (email: string, password: string) =>
    apiClient('/api/vendors/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyEmail: (token: string) =>
    apiClient('/api/vendors/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  forgotPassword: (email: string) =>
    apiClient('/api/vendors/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    apiClient('/api/vendors/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),

  getProfile: () =>
    apiClient('/api/vendors/profile', {
      requiresAuth: true,
    }),

  updateProfile: (updates: any) =>
    apiClient('/api/vendors/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
      requiresAuth: true,
    }),

  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient('/api/vendors/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ oldPassword, newPassword }),
      requiresAuth: true,
    }),

  logout: () =>
    apiClient('/api/vendors/logout', {
      method: 'POST',
      requiresAuth: true,
    }),
};

// Product API functions
export const productApi = {
  getAll: () => apiClient('/api/products', { requiresAuth: true }),

  create: (formData: FormData) =>
    fetch('/api/products', {
      method: 'POST',
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    }),

  update: (id: string, formData: FormData) =>
    fetch(`/api/products/${id}`, {
      method: 'PUT',
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    }),

  delete: (id: string) =>
    apiClient(`/api/products/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};
