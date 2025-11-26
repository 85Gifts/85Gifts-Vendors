interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiClient(
  endpoint: string, 
  options: FetchOptions = {}
) {
  const { requiresAuth = false, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: 'include', // Include cookies in requests
  };

  const response = await fetch(endpoint, config);
  const data = await response.json();

  if (!response.ok) {
    // Safely extract error message from various possible formats
    const errorMessage = 
      data?.error?.message || 
      (typeof data?.error === 'string' ? data.error : null) ||
      data?.message || 
      data?.detail ||
      'API request failed';
    
    throw new Error(errorMessage);
  }

  return data;
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
