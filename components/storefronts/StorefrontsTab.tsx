"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileEdit,
  LayoutGrid,
  Loader2,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Store,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { StorefrontFormDialog } from "@/components/storefronts/StorefrontFormDialog"
import { StorefrontStatusBadge } from "@/components/storefronts/StorefrontStatusBadge"
import { storefrontApi } from "@/lib/storefrontApi"
import type {
  Storefront,
  StorefrontSummary,
} from "@/app/types/storefront"

const PAGE_SIZE = 12

type PublishedFilter = "all" | "published" | "draft"
type SortOption = "newest" | "oldest" | "name"

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—"

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number | string
  icon: typeof Store
  accent: string
}) {
  return (
    <Card className="py-4">
      <CardContent className="flex items-center gap-3 px-4">
        <div className={`flex size-10 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function StorefrontCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-28 w-full rounded-none" />
      <CardHeader className="gap-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
      <CardFooter className="gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </CardFooter>
    </Card>
  )
}

export default function StorefrontsTab() {
  const { toast } = useToast()

  const [storefronts, setStorefronts] = useState<Storefront[]>([])
  const [summary, setSummary] = useState<StorefrontSummary | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    pages: 1,
  })
  const [page, setPage] = useState(1)
  const [publishedFilter, setPublishedFilter] =
    useState<PublishedFilter>("all")
  const [sort, setSort] = useState<SortOption>("newest")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Storefront | null>(null)
  const [toDelete, setToDelete] = useState<Storefront | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchStorefronts = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const result = await storefrontApi.list({
        page,
        limit: PAGE_SIZE,
        isPublished:
          publishedFilter === "all"
            ? undefined
            : publishedFilter === "published",
        sortBy: sort === "name" ? "name" : "createdAt",
        sortOrder: sort === "newest" ? "desc" : "asc",
      })
      setStorefronts(result.storefronts)
      setPagination(result.pagination)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load your storefronts."
      )
    } finally {
      setLoading(false)
    }
  }, [page, publishedFilter, sort])

  const fetchSummary = useCallback(async () => {
    try {
      setSummary(await storefrontApi.summary())
    } catch {
      // The summary endpoint is additive; the list remains usable without it.
      setSummary(null)
    }
  }, [])

  useEffect(() => {
    fetchStorefronts()
  }, [fetchStorefronts])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (storefront: Storefront) => {
    setEditing(storefront)
    setFormOpen(true)
  }

  const handleSaved = () => {
    setEditing(null)
    if (page !== 1) {
      setPage(1)
    } else {
      fetchStorefronts()
    }
    fetchSummary()
  }

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await storefrontApi.remove(toDelete._id)
      toast({
        title: "Storefront deleted",
        description: `${toDelete.name} and its product links were removed.`,
        variant: "success",
      })
      setToDelete(null)
      if (storefronts.length === 1 && page > 1) {
        setPage((current) => current - 1)
      } else {
        fetchStorefronts()
      }
      fetchSummary()
    } catch (err) {
      toast({
        title: "Delete failed",
        description:
          err instanceof Error ? err.message : "Could not delete the storefront.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const changeFilter = (value: string) => {
    setPage(1)
    setPublishedFilter(value as PublishedFilter)
  }

  const changeSort = (value: string) => {
    setPage(1)
    setSort(value as SortOption)
  }

  const hasStorefronts = storefronts.length > 0

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Your storefronts</h2>
          <p className="text-sm text-muted-foreground">
            Group products into a shareable storefront, then request approval to
            publish it.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          New storefront
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard
          label="Total storefronts"
          value={summary?.totalStorefronts ?? pagination.total}
          icon={Store}
          accent="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
        />
        <SummaryCard
          label="Published"
          value={summary?.publishedStorefronts ?? "—"}
          icon={Eye}
          accent="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
        />
        <SummaryCard
          label="Drafts"
          value={summary?.draftStorefronts ?? "—"}
          icon={FileEdit}
          accent="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
        />
        <SummaryCard
          label="Products across storefronts"
          value={summary?.totalProductsAcrossStorefronts ?? "—"}
          icon={Package}
          accent="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select value={publishedFilter} onValueChange={changeFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All storefronts</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Not published</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={changeSort}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <LayoutGrid className="size-4" />
          {pagination.total} {pagination.total === 1 ? "storefront" : "storefronts"}
        </div>
      </div>

      {error ? (
        <Card className="border-destructive/30">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertCircle className="size-8 text-destructive" />
            <div>
              <p className="font-medium">Could not load storefronts</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" onClick={fetchStorefronts}>
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <StorefrontCardSkeleton key={index} />
          ))}
        </div>
      ) : !hasStorefronts ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Store className="size-7 text-muted-foreground" />
            </div>
            <div className="max-w-md space-y-1">
              <p className="text-lg font-semibold">
                {publishedFilter === "all"
                  ? "You have not created a storefront yet"
                  : "No storefronts match this filter"}
              </p>
              <p className="text-sm text-muted-foreground">
                {publishedFilter === "all"
                  ? "Create a storefront, add products, then request approval to publish it."
                  : "Try a different status filter to see your other storefronts."}
              </p>
            </div>
            {publishedFilter === "all" && (
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Create your first storefront
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {storefronts.map((storefront) => {
            const banner = storefront.displaySettings?.banner

            return (
              <Card key={storefront._id} className="flex flex-col overflow-hidden">
                <div
                  className="relative h-28 bg-muted bg-cover bg-center"
                  style={
                    banner
                      ? { backgroundImage: `url("${banner.replace(/"/g, "%22")}")` }
                      : undefined
                  }
                >
                  {!banner && (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 via-background to-purple-100 dark:from-blue-950 dark:via-background dark:to-purple-950">
                      <Store className="size-9 text-muted-foreground/60" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <StorefrontStatusBadge status={storefront.publishStatus} />
                  </div>
                </div>

                <CardHeader className="gap-1 pb-2">
                  <CardTitle className="truncate text-base">
                    {storefront.name}
                  </CardTitle>
                  <code className="truncate text-xs text-muted-foreground">
                    /{storefront.slug}
                  </code>
                </CardHeader>

                <CardContent className="flex-1 space-y-3 pb-3">
                  <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
                    {storefront.description || "No description yet."}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="gap-1">
                      <Package className="size-3" />
                      {storefront.products.length}{" "}
                      {storefront.products.length === 1 ? "product" : "products"}
                    </Badge>
                    <span>{storefront.analytics.views} views</span>
                    <span aria-hidden="true">·</span>
                    <span>Updated {formatDate(storefront.updatedAt)}</span>
                  </div>
                </CardContent>

                <CardFooter className="gap-2 border-t pt-3">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/dashboard/storefronts/${storefront._id}`}>
                      Manage
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Edit ${storefront.name}`}
                    onClick={() => openEdit(storefront)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    aria-label={`Delete ${storefront.name}`}
                    onClick={() => setToDelete(storefront)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((current) => Math.min(pagination.pages, current + 1))
              }
              disabled={page >= pagination.pages || loading}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <StorefrontFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        storefront={editing}
        onSaved={handleSaved}
      />

      <AlertDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => {
          if (!open && !deleting) setToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this storefront?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete
                ? `“${toDelete.name}” and its product links will be removed. The products themselves will not be deleted.`
                : "This storefront and its product links will be removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {toDelete?.publishStatus === "pending" && (
            <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              This storefront has a pending approval request. Deleting it may
              cancel that request.
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(event) => {
                event.preventDefault()
                handleDelete()
              }}
              disabled={deleting}
            >
              {deleting && <Loader2 className="size-4 animate-spin" />}
              Delete storefront
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
