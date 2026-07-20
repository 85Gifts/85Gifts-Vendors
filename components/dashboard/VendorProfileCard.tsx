"use client"

import { Button } from "@/components/ui/button"

interface VendorProfile {
  _id?: string
  name: string
  businessName?: string
  email: string
  phone: string
  address: string
  totalOrders?: number
  joinDate: string
  createdAt?: string
  updatedAt?: string
}

interface VendorProfileCardProps {
  profile: VendorProfile | null
  loading: boolean
  error: string
  onRetry: () => void
}

export default function VendorProfileCard({
  profile,
  loading,
  error,
  onRetry,
}: VendorProfileCardProps) {
  return (
    <div className="bg-card rounded-xl shadow-sm border dark:border-border p-6">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Vendor Profile</h3>
      {loading ? (
        <div className="py-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading profile...</p>
        </div>
      ) : error ? (
        <div className="py-4 text-center">
          <p className="text-red-600 dark:text-red-400 text-sm font-semibold">Error loading profile</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
           <Button
            variant="link"
            size="sm"
            onClick={onRetry}
            className="mt-2 h-auto p-0 text-xs"
          >
            Try again
          </Button>
        </div>
      ) : profile ? (
        <div className="space-y-3">
          <div>
            <span className="text-muted-foreground text-sm">Business Name</span>
            <div className="font-medium dark:text-white">{profile.businessName || profile.name}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-sm">Contact Name</span>
            <div className="font-medium dark:text-white">{profile.name}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-sm">Email</span>
            <div className="font-medium dark:text-white">{profile.email}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-sm">Phone</span>
            <div className="font-medium dark:text-white">{profile.phone}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-sm">Address</span>
            <div className="font-medium text-sm dark:text-white">{profile.address}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-sm">Member Since</span>
            <div className="font-medium dark:text-white">{profile.joinDate}</div>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center">
          <p className="text-muted-foreground text-sm">No profile data available</p>
        </div>
      )}
    </div>
  )
}
