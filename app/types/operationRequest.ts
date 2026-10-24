import type { Pagination } from '@/app/types/admin'

export type OperationRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'

/**
 * Known request types. The backend may add more, so consumers should render an
 * unknown type defensively instead of assuming this union is exhaustive.
 */
export type OperationRequestType = 'storefront_publish'

export interface StorefrontPublishPayload {
  storefrontId: string
  name?: string
  slug?: string
}

export interface OperationRequest<
  TPayload = Record<string, unknown>
> {
  _id: string
  type: OperationRequestType | string
  status: OperationRequestStatus
  requesterId: string
  requesterRole: 'vendor' | string
  targetId?: string
  targetType?: string
  payload: TPayload
  reviewedBy?: string
  reviewedAt?: string
  reviewNote?: string
  createdAt: string
  updatedAt: string
}

export type StorefrontPublishRequest =
  OperationRequest<StorefrontPublishPayload>

export interface OperationRequestList<
  TPayload = Record<string, unknown>
> {
  requests: Array<OperationRequest<TPayload>>
  pagination: Pagination
}
