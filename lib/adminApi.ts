import {
  DashboardStats,
  AdminEvent,
  WalletTransaction,
  SettlementWallet,
  SettlementStats,
  SettlementTransaction,
  FeeConfig,
  Pagination,
} from '@/app/types/admin'
import type { OperationRequest } from '@/app/types/operationRequest'
import type {
  Category,
  CategoryType,
  CreateCategoryBody,
  UpdateCategoryBody,
} from '@/app/types/category'
import {
  ADMIN_PREVIEW,
  previewStats,
  previewEvents,
  previewWalletTransactions,
  previewSettlementWallet,
  previewSettlementStats,
  previewSettlementTransactions,
  previewFeeConfigs,
  previewOperationRequests,
  previewAdminUser,
  previewCategories,
  previewList,
} from '@/lib/adminPreview'

interface ListResult<T> {
  items: T[]
  pagination: Pagination
}

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

function inner(json: any): any {
  return json?.data ?? json
}

function toList<T>(json: any): { items: T[]; pagination: Pagination } {
  const payload = inner(json)
  return {
    items: Array.isArray(payload?.data) ? (payload.data as T[]) : [],
    pagination: payload?.pagination ?? {
      page: 1,
      limit: 20,
      total: 0,
      pages: 1,
    },
  }
}

function toOperationRequestList(json: any): ListResult<OperationRequest> {
  const payload = inner(json)
  const requests = Array.isArray(payload?.requests)
    ? (payload.requests as OperationRequest[])
    : Array.isArray(payload?.data)
      ? (payload.data as OperationRequest[])
      : []

  return {
    items: requests,
    pagination: payload?.pagination ?? {
      page: 1,
      limit: 20,
      total: requests.length,
      pages: 1,
    },
  }
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  const s = searchParams.toString()
  return s ? `?${s}` : ''
}

export const adminApi = {
  dashboardStats: async (): Promise<DashboardStats> => {
    if (ADMIN_PREVIEW) return previewStats
    const json = await request('/api/admin/dashboard/stats')
    return inner(json)?.data ?? ({} as DashboardStats)
  },

  listEvents: async (
    params: Record<string, string | number | undefined>
  ): Promise<ListResult<AdminEvent>> => {
    if (ADMIN_PREVIEW) {
      const { search, status, category } = params
      const filtered = previewEvents.filter((e) => {
        const matchesStatus = !status || e.status === status
        const matchesCategory = !category || e.category === category
        const matchesSearch =
          !search ||
          e.name.toLowerCase().includes(String(search).toLowerCase()) ||
          e.description?.toLowerCase().includes(String(search).toLowerCase())
        return matchesStatus && matchesCategory && matchesSearch
      })
      return previewList(filtered)
    }
    const json = await request(`/api/admin/events${buildQuery(params)}`)
    return toList<AdminEvent>(json)
  },

  getEvent: async (eventId: string): Promise<AdminEvent> => {
    if (ADMIN_PREVIEW) {
      return previewEvents.find((e) => e._id === eventId) ?? previewEvents[0]
    }
    const json = await request(`/api/admin/events/${eventId}`)
    return inner(json)?.data as AdminEvent
  },

  updateEvent: async (eventId: string, body: Record<string, unknown>): Promise<AdminEvent> => {
    if (ADMIN_PREVIEW) {
      const current = previewEvents.find((e) => e._id === eventId) ?? previewEvents[0]
      return { ...current, ...(body as Partial<AdminEvent>) }
    }
    const json = await request(`/api/admin/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
    return inner(json)?.data as AdminEvent
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    if (ADMIN_PREVIEW) {
      const idx = previewEvents.findIndex((e) => e._id === eventId)
      if (idx !== -1) previewEvents.splice(idx, 1)
      return
    }
    await request(`/api/admin/events/${eventId}`, { method: 'DELETE' })
  },

  publishEvent: async (eventId: string): Promise<void> => {
    if (ADMIN_PREVIEW) {
      const event = previewEvents.find((e) => e._id === eventId)
      if (event) event.status = 'published'
      return
    }
    await request(`/api/admin/events/${eventId}/publish`, { method: 'POST' })
  },

  notifyBookings: async (eventId: string, body: { message: string; subject?: string }): Promise<void> => {
    if (ADMIN_PREVIEW) return
    await request(`/api/admin/events/${eventId}/bookings/notify`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  walletTransactions: async (
    params: Record<string, string | number | undefined>
  ): Promise<ListResult<WalletTransaction>> => {
    if (ADMIN_PREVIEW) {
      const { type, category, status, reference } = params
      const filtered = previewWalletTransactions.filter((tx) => {
        const matchesType = !type || tx.type === type
        const matchesCategory = !category || tx.category === category
        const matchesStatus = !status || tx.status === status
        const matchesReference =
          !reference || tx.reference.toLowerCase().includes(String(reference).toLowerCase())
        return matchesType && matchesCategory && matchesStatus && matchesReference
      })
      return previewList(filtered)
    }
    const json = await request(`/api/admin/wallet-transactions${buildQuery(params)}`)
    return toList<WalletTransaction>(json)
  },

  settlementWallet: async (): Promise<{ wallet: SettlementWallet; stats: SettlementStats }> => {
    if (ADMIN_PREVIEW) {
      return { wallet: previewSettlementWallet, stats: previewSettlementStats }
    }
    const json = await request('/api/admin/settlement/wallet')
    const payload = inner(json)?.data ?? {}
    return {
      wallet: payload.wallet ?? {
        balance: 0,
        totalCollected: 0,
        totalDisbursed: 0,
        currency: 'NGN',
      },
      stats: payload.stats ?? {
        totalTransactions: 0,
        lastWeekCollected: 0,
        lastMonthCollected: 0,
        collectedByService: [],
      },
    }
  },

  settlementTransactions: async (
    params: Record<string, string | number | undefined>
  ): Promise<ListResult<SettlementTransaction>> => {
    if (ADMIN_PREVIEW) {
      const { serviceType } = params
      const filtered = previewSettlementTransactions.filter(
        (tx) => !serviceType || tx.serviceType === serviceType
      )
      return previewList(filtered)
    }
    const json = await request(`/api/admin/settlement/transactions${buildQuery(params)}`)
    return toList<SettlementTransaction>(json)
  },

  feeConfigs: async (): Promise<FeeConfig[]> => {
    if (ADMIN_PREVIEW) return [...previewFeeConfigs]
    const json = await request('/api/admin/fee-configs')
    const payload = inner(json)
    return Array.isArray(payload?.data) ? (payload.data as FeeConfig[]) : []
  },

  createFeeConfig: async (body: Record<string, unknown>): Promise<FeeConfig> => {
    if (ADMIN_PREVIEW) {
      const config: FeeConfig = {
        _id: `preview-${Date.now()}`,
        serviceType: String(body.serviceType),
        feeType: body.feeType as FeeConfig['feeType'],
        feeValue: Number(body.feeValue || 0),
        minFee: body.minFee !== undefined ? Number(body.minFee) : undefined,
        maxFee: body.maxFee !== undefined ? Number(body.maxFee) : undefined,
        currency: String(body.currency || 'NGN'),
        isActive: true,
        description: String(body.description || ''),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      previewFeeConfigs.push(config)
      return config
    }
    const json = await request('/api/admin/fee-configs', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return inner(json)?.data as FeeConfig
  },

  updateFeeConfig: async (serviceType: string, body: Record<string, unknown>): Promise<FeeConfig> => {
    if (ADMIN_PREVIEW) {
      const idx = previewFeeConfigs.findIndex((c) => c.serviceType === serviceType)
      if (idx === -1) throw new Error(`No fee configuration found for service: ${serviceType}`)
      const next: FeeConfig = {
        ...previewFeeConfigs[idx],
        feeType: (body.feeType as FeeConfig['feeType']) ?? previewFeeConfigs[idx].feeType,
        feeValue: body.feeValue !== undefined ? Number(body.feeValue) : previewFeeConfigs[idx].feeValue,
        minFee: body.minFee !== undefined ? Number(body.minFee) : previewFeeConfigs[idx].minFee,
        maxFee: body.maxFee !== undefined ? Number(body.maxFee) : previewFeeConfigs[idx].maxFee,
        description: body.description !== undefined ? String(body.description) : previewFeeConfigs[idx].description,
        updatedAt: new Date().toISOString(),
      }
      previewFeeConfigs[idx] = next
      return next
    }
    const json = await request(`/api/admin/fee-configs/${encodeURIComponent(serviceType)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
    return inner(json)?.data as FeeConfig
  },

  toggleFeeConfig: async (serviceType: string, isActive: boolean): Promise<FeeConfig> => {
    if (ADMIN_PREVIEW) {
      const idx = previewFeeConfigs.findIndex((c) => c.serviceType === serviceType)
      if (idx === -1) throw new Error(`No fee configuration found for service: ${serviceType}`)
      previewFeeConfigs[idx] = {
        ...previewFeeConfigs[idx],
        isActive,
        updatedAt: new Date().toISOString(),
      }
      return previewFeeConfigs[idx]
    }
    const json = await request(`/api/admin/fee-configs/${encodeURIComponent(serviceType)}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    })
    return inner(json)?.data as FeeConfig
  },

  listOperationRequests: async (
    params: Record<string, string | number | undefined>
  ): Promise<ListResult<OperationRequest>> => {
    if (ADMIN_PREVIEW) {
      const { status, type } = params
      const filtered = previewOperationRequests
        .filter((r) => {
          const matchesStatus = !status || r.status === status
          const matchesType = !type || r.type === type
          return matchesStatus && matchesType
        })
        .slice()
        .sort(
          (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
        )
      return previewList(filtered)
    }
    const json = await request(`/api/admin/operation-requests${buildQuery(params)}`)
    return toOperationRequestList(json)
  },

  getOperationRequest: async (requestId: string): Promise<OperationRequest> => {
    if (ADMIN_PREVIEW) {
      const found = previewOperationRequests.find((r) => r._id === requestId)
      if (!found) throw new Error('Operation request not found')
      return found
    }
    const json = await request(`/api/admin/operation-requests/${requestId}`)
    const data = inner(json)
    return (data?.request ?? data) as OperationRequest
  },

  approveOperationRequest: async (
    requestId: string,
    note?: string
  ): Promise<OperationRequest> => {
    if (ADMIN_PREVIEW) {
      const request = previewOperationRequests.find((r) => r._id === requestId)
      if (!request) throw new Error('Operation request not found')
      const now = new Date().toISOString()
      request.status = 'approved'
      request.reviewedBy = previewAdminUser._id
      request.reviewedAt = now
      request.reviewNote = note?.trim() || undefined
      request.updatedAt = now
      return request
    }
    const trimmed = note?.trim()
    const json = await request(
      `/api/admin/operation-requests/${requestId}/approve`,
      {
        method: 'POST',
        body: JSON.stringify(trimmed ? { note: trimmed } : {}),
      }
    )
    const data = inner(json)
    return (data?.request ?? data) as OperationRequest
  },

  rejectOperationRequest: async (
    requestId: string,
    note: string
  ): Promise<OperationRequest> => {
    if (ADMIN_PREVIEW) {
      const request = previewOperationRequests.find((r) => r._id === requestId)
      if (!request) throw new Error('Operation request not found')
      const now = new Date().toISOString()
      request.status = 'rejected'
      request.reviewedBy = previewAdminUser._id
      request.reviewedAt = now
      request.reviewNote = note.trim()
      request.updatedAt = now
      return request
    }
    const json = await request(
      `/api/admin/operation-requests/${requestId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ note: note.trim() }),
      }
    )
    const data = inner(json)
    return (data?.request ?? data) as OperationRequest
  },

  listCategories: async (type?: CategoryType): Promise<Category[]> => {
    if (ADMIN_PREVIEW) {
      return previewCategories
        .filter((category) => !type || category.type === type)
        .slice()
        .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
    }
    // GET /api/admin/categories?type=event|product — payload is { success, data: { message, data: Category[] } }
    const json = await request(`/api/admin/categories${buildQuery({ type })}`)
    const payload = inner(json)
    if (Array.isArray(payload?.data)) return payload.data as Category[]
    if (Array.isArray(payload)) return payload as Category[]
    return []
  },

  createCategory: async (body: CreateCategoryBody): Promise<Category> => {
    if (ADMIN_PREVIEW) {
      const name = body.name.trim()
      const exists = previewCategories.some(
        (category) =>
          category.type === body.type &&
          category.name.toLowerCase() === name.toLowerCase()
      )
      if (exists) {
        throw new Error(`A ${body.type} category named "${name}" already exists`)
      }
      const created: Category = {
        _id: `preview-cat-${Date.now()}`,
        name,
        type: body.type,
        createdBy: previewAdminUser._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      previewCategories.unshift(created)
      return created
    }
    const json = await request('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name: body.name.trim(), type: body.type }),
    })
    return inner(json)?.data as Category
  },

  updateCategory: async (
    categoryId: string,
    body: UpdateCategoryBody
  ): Promise<Category> => {
    const payload: UpdateCategoryBody = {}
    if (body.name !== undefined) payload.name = body.name.trim()
    if (body.type !== undefined) payload.type = body.type

    if (payload.name === undefined && payload.type === undefined) {
      throw new Error('Send at least a name or type to update')
    }

    if (ADMIN_PREVIEW) {
      const idx = previewCategories.findIndex((category) => category._id === categoryId)
      if (idx === -1) throw new Error('Category not found')

      const nextName = payload.name ?? previewCategories[idx].name
      const nextType = payload.type ?? previewCategories[idx].type
      const conflict = previewCategories.some(
        (category) =>
          category._id !== categoryId &&
          category.type === nextType &&
          category.name.toLowerCase() === nextName.toLowerCase()
      )
      if (conflict) {
        throw new Error(`A ${nextType} category named "${nextName}" already exists`)
      }

      previewCategories[idx] = {
        ...previewCategories[idx],
        name: nextName,
        type: nextType,
        updatedAt: new Date().toISOString(),
      }
      return previewCategories[idx]
    }

    const json = await request(`/api/admin/categories/${encodeURIComponent(categoryId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return inner(json)?.data as Category
  },

  deleteCategory: async (categoryId: string): Promise<void> => {
    if (ADMIN_PREVIEW) {
      const idx = previewCategories.findIndex((category) => category._id === categoryId)
      if (idx === -1) throw new Error('Category not found')
      previewCategories.splice(idx, 1)
      return
    }
    await request(`/api/admin/categories/${encodeURIComponent(categoryId)}`, {
      method: 'DELETE',
    })
  },

  pendingOperationRequestCount: async (): Promise<number> => {
    if (ADMIN_PREVIEW) {
      return previewOperationRequests.filter((r) => r.status === 'pending').length
    }
    const json = await request(
      '/api/admin/operation-requests?status=pending&limit=1'
    )
    return toOperationRequestList(json).pagination.total
  },
}