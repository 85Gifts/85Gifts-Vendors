import { apiClient } from '@/lib/api'
import type { Pagination } from '@/app/types/admin'
import type {
  OperationRequest,
  OperationRequestList,
  OperationRequestStatus,
  StorefrontPublishPayload,
} from '@/app/types/operationRequest'

type QueryValue = string | number | undefined

function buildQuery(params: Record<string, QueryValue> = {}): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

function payload(json: any): any {
  return json?.data?.data ?? json?.data ?? json
}

function asRecord(value: any): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : {}
}

function toNumber(value: unknown, fallback = 0): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function normalizePagination(raw: any): Pagination {
  const pagination = asRecord(raw)
  return {
    page: toNumber(pagination.page, 1),
    limit: toNumber(pagination.limit, 20),
    total: toNumber(pagination.total),
    pages: toNumber(pagination.pages, 1),
  }
}

function normalizeOperationRequest(raw: any): OperationRequest | null {
  const request = asRecord(raw)
  if (!request._id) return null

  return {
    ...request,
    _id: String(request._id),
    type: String(request.type ?? ''),
    status: String(request.status ?? 'pending') as OperationRequestStatus,
    requesterId: String(request.requesterId ?? ''),
    requesterRole: String(request.requesterRole ?? 'vendor'),
    payload: asRecord(request.payload),
    createdAt: String(request.createdAt ?? ''),
    updatedAt: String(request.updatedAt ?? ''),
  } as OperationRequest
}

function normalizeList(json: any): OperationRequestList {
  const data = payload(json)
  const list = Array.isArray(data?.requests)
    ? data.requests
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : []

  return {
    requests: list
      .map(normalizeOperationRequest)
      .filter((request: OperationRequest | null): request is OperationRequest =>
        Boolean(request)
      ),
    pagination: normalizePagination(data?.pagination),
  }
}

export const vendorOperationRequestApi = {
  list: async (
    params: Record<string, QueryValue> = {}
  ): Promise<OperationRequestList> => {
    const json = await apiClient(
      `/api/operation-requests${buildQuery(params)}`,
      { requiresAuth: true }
    )
    return normalizeList(json)
  },

  cancel: async (requestId: string): Promise<OperationRequest | null> => {
    const json = await apiClient(
      `/api/operation-requests/${encodeURIComponent(requestId)}/cancel`,
      { method: 'POST', requiresAuth: true }
    )
    const data = payload(json)
    return normalizeOperationRequest(data?.request ?? data)
  },
}

/**
 * Finds the most recent publish request for a storefront. The documented
 * vendor list endpoint may not support filtering by target, so callers should
 * fetch a page of requests and filter locally.
 */
export function findLatestStorefrontRequest(
  requests: OperationRequest[],
  storefrontId: string
): OperationRequest<StorefrontPublishPayload> | undefined {
  return requests
    .filter((request) => {
      const publishPayload =
        request.payload as unknown as StorefrontPublishPayload
      return (
        publishPayload?.storefrontId === storefrontId ||
        request.targetId === storefrontId
      )
    })
    .sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
    )[0] as unknown as
    | OperationRequest<StorefrontPublishPayload>
    | undefined
}
