export interface AdminUser {
  _id: string
  userName: string
  email: string
  role: 'superAdmin' | 'admin' | 'subAdmin'
  lastLogin?: string
  createdAt?: string
  updatedAt?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface DashboardStats {
  totalVendors: number
  totalPublishedEvents: number
  pendingEventReviews: number
  totalBookings: number
  paidBookingsRevenue: number
  pendingWithdrawalsCount: number
  pendingWithdrawalsAmount: number
  newVendorsLast30Days: number
}

export type AdminEventStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected'
  | 'cancelled'
  | 'ended'

export interface AdminVendorRef {
  _id: string
  name?: string
  businessName?: string
  email?: string
}

export interface AdminEvent {
  _id: string
  name: string
  slug?: string
  description?: string
  category?: string
  status?: AdminEventStatus
  startAt?: string
  endAt?: string
  image?: string
  emoji?: string
  location?: {
    venue?: string
    address?: string
    city?: string
    state?: string
  }
  vendor?: AdminVendorRef
  vendorId?: string
  totalCapacity?: number
  totalSold?: number
  tiers?: Array<{ name?: string; price?: number; capacity?: number; sold?: number }>
  rejectionReason?: string
  createdAt?: string
  updatedAt?: string
}

export type WalletTransactionType = 'credit' | 'debit'
export type WalletTransactionCategory =
  | 'sale'
  | 'refund'
  | 'withdrawal'
  | 'funding'
  | 'bonus'
  | 'adjustment'
  | 'fee'
  | 'reversal'
export type WalletTransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed'

export interface WalletTransaction {
  _id: string
  wallet: string
  vendor?: AdminVendorRef
  vendorId?: string
  type: WalletTransactionType
  category: WalletTransactionCategory
  amount: number
  currency: string
  balanceBefore?: number
  balanceAfter?: number
  status: WalletTransactionStatus
  reference: string
  description?: string
  metadata?: Record<string, unknown>
  processedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface SettlementWallet {
  _id?: string
  balance: number
  totalCollected: number
  totalDisbursed: number
  currency: string
  lastCreditAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface SettlementStats {
  totalTransactions: number
  lastWeekCollected: number
  lastMonthCollected: number
  collectedByService: Array<{ serviceType: string; total: number; count: number }>
}

export interface SettlementTransaction {
  _id: string
  vendorTransactionRef: string
  vendorId?: AdminVendorRef
  serviceType: string
  amount: number
  currency: string
  feeConfigSnapshot?: {
    feeType: 'fixed' | 'percentage'
    feeValue: number
    minFee?: number
    maxFee?: number
    baseAmount?: number
  }
  description?: string
  metadata?: Record<string, unknown>
  reference: string
  createdAt?: string
  updatedAt?: string
}

export type FeeType = 'fixed' | 'percentage'

export interface FeeConfig {
  _id: string
  serviceType: string
  feeType: FeeType
  feeValue: number
  minFee?: number
  maxFee?: number
  currency: string
  isActive: boolean
  description?: string
  createdAt?: string
  updatedAt?: string
}