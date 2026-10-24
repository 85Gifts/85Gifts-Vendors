import type {
  Storefront,
  StorefrontUiState,
} from '@/app/types/storefront'
import type {
  OperationRequest,
  StorefrontPublishPayload,
} from '@/app/types/operationRequest'

/**
 * Derives the vendor-facing state. `isPublished` wins, then a pending request,
 * then a rejection, and otherwise the storefront is a draft.
 */
export function deriveStorefrontUiState(
  storefront: Storefront,
  latestRequest?: OperationRequest<StorefrontPublishPayload> | null
): StorefrontUiState {
  if (storefront.isPublished) return 'published'

  if (
    storefront.publishStatus === 'pending' ||
    latestRequest?.status === 'pending'
  ) {
    return 'pending'
  }

  if (
    storefront.publishStatus === 'rejected' ||
    latestRequest?.status === 'rejected'
  ) {
    return 'rejected'
  }

  return 'draft'
}
