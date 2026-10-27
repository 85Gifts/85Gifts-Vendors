import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { StorefrontPublishStatus } from "@/app/types/storefront"

const STATUS_STYLES: Record<StorefrontPublishStatus, string> = {
  draft: "text-muted-foreground bg-muted",
  pending: "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950",
  published: "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-950",
  rejected: "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950",
}

const STATUS_LABELS: Record<StorefrontPublishStatus, string> = {
  draft: "Draft",
  pending: "Pending approval",
  published: "Published",
  rejected: "Rejected",
}

export function StorefrontStatusBadge({
  status,
  className,
}: {
  status: StorefrontPublishStatus
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", STATUS_STYLES[status], className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  )
}
