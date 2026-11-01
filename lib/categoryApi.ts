import type { Category, CategoryType } from '@/app/types/category'

async function request<T = any>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message =
      data?.error?.message ||
      (typeof data?.error === 'string' ? data.error : null) ||
      data?.message ||
      'Request failed'
    const error: Error & { status?: number; code?: string } = new Error(message)
    error.status = response.status
    error.code = data?.code
    throw error
  }
  return data
}

function unwrapCategories(json: any): Category[] {
  const payload = json?.data?.data ?? json?.data ?? json
  if (Array.isArray(payload)) return payload as Category[]
  if (Array.isArray(payload?.data)) return payload.data as Category[]
  return []
}

export const categoryApi = {
  list: async (type?: CategoryType): Promise<Category[]> => {
    const query = type ? `?type=${encodeURIComponent(type)}` : ''
    const json = await request(`/api/categories${query}`)
    return unwrapCategories(json)
  },
}
