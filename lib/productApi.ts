import { apiClient } from './apiClient';

export const productApi = {
  getAll: () => apiClient('/vendors/products', { requiresAuth: true }),
      
  create: (formData: FormData) =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/products`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      return data;
    }),

  update: (id: string, formData: FormData) =>
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/vendors/products/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      return data;
    }),

  delete: (id: string) =>
    apiClient(`/vendors/products/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};
