import { apiClient } from './apiClient';

export const vendorApi = {
  // Register = Login
  register: (userData: { name: string; email: string; password: string }) =>
    apiClient('/vendors', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getProfile: (vendorId: string) =>
    apiClient(`/vendors/${vendorId}`, { requiresAuth: true }),

  updateProfile: (vendorId: string, updates: Partial<{ name: string; email: string }>) =>
    apiClient(`/vendors/${vendorId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      requiresAuth: true,
    }),

  changePassword: (vendorId: string, oldPassword: string, newPassword: string) =>
    apiClient(`/vendors/${vendorId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
      requiresAuth: true,
    }),

  deleteAccount: (vendorId: string) =>
    apiClient(`/vendors/${vendorId}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),

  // Client-side only
  logout: () => {
    localStorage.removeItem('accessToken');
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970; Secure; HttpOnly; SameSite=Strict';
    window.location.href = '/login';
  },
};
