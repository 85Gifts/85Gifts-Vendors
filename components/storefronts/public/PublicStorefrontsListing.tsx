'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BadgeCheckIcon,
  LoaderCircleIcon,
  PackageIcon,
  PackageSearchIcon,
  RotateCcwIcon,
  SearchIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  StoreIcon,
  XIcon,
} from '@animateicons/react/lucide'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { PublicNavbar } from '@/components/public-navbar'
import { PublicFooter } from '@/components/public-footer'
import { StorefrontCard } from '@/components/storefronts/public/StorefrontCard'
import { cssBackgroundImage } from '@/lib/backgroundImage'
import { publicStorefrontApi, PublicStorefrontApiError } from '@/lib/publicStorefrontApi'
import {
  STOREFRONT_PATTERN_STYLE,
  storefrontAccent,
  storefrontInitials,
} from '@/lib/storefrontVisuals'
import type {
  PublicStorefrontListItem,
  PublicStorefrontListResult,
} from '@/app/types/publicStorefront'

export type StorefrontSort = 'newest' | 'oldest' | 'name' | 'name-desc'

export interface StorefrontListingQuery {
  page: number
  search: string
  sort: StorefrontSort
}

const PAGE_SIZE = 12

const SORT_OPTIONS: Array<{ value: StorefrontSort; label: string }> = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
]

function sortParams(sort: StorefrontSort): {
  sortBy: 'publishedAt' | 'name'
  sortOrder: 'asc' | 'desc'
} {
  switch (sort) {
    case 'oldest':
      return { sortBy: 'publishedAt', sortOrder: 'asc' }
    case 'name':
      return { sortBy: 'name', sortOrder: 'asc' }
    case 'name-desc':
      return { sortBy: 'name', sortOrder: 'desc' }
    default:
      return { sortBy: 'publishedAt', sortOrder: 'desc' }
  }
}

function pageNumbers(current: number, pages: number): number[] {
  if (pages <= 7) {
    return Array.from({ length: pages }, (_, index) => index + 1)
  }
  const start = Math.max(1, Math.min(current - 1, pages - 4))
  return Array.from({ length: 5 }, (_, index) => start + index)
}

function ListingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[1.6rem] border bg-card"
        >
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function PreviewArt({ storefront }: { storefront: PublicStorefrontListItem }) {
  const banner = storefront.displaySettings?.banner
  if (banner) {
    return (
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        style={{ backgroundImage: cssBackgroundImage(banner) }}
        aria-hidden="true"
      />
    )
  }

  return (
    <div
      className={`absolute inset-0 ${storefrontAccent(storefront.slug)}`}
      aria-hidden="true"
    >
      <div className="absolute -right-4 -top-6 text-[7rem] font-bold leading-none text-white/10">
        {storefrontInitials(storefront.name).slice(0, 1)}
      </div>
    </div>
  )
}

function HeroShowcase({
  storefronts,
}: {
  storefronts: PublicStorefrontListItem[]
}) {
  const [featured, second, third] = storefronts.slice(0, 3)
  if (!featured) return null

  return (
    <div className="relative mx-auto hidden h-[430px] w-full max-w-[470px] lg:block">
      <div
        className="absolute inset-x-10 top-2 h-[300px] rounded-[1.5rem] border border-white/10 bg-white/[0.04]"
        aria-hidden="true"
      />

      {third ? (
        <div className="absolute left-20 right-0 top-8 z-10 h-[280px] rotate-[3deg] overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#0a0f1d] shadow-2xl shadow-black/40 transition-transform duration-300 hover:rotate-[1.5deg]">
          <div className="relative h-24 overflow-hidden">
            <PreviewArt storefront={third} />
          </div>
          <div className="px-4 pb-4">
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
              {third.vendor?.businessName || 'Independent vendor'}
            </div>
            <div className="mt-1 line-clamp-1 text-sm font-semibold text-white">
              {third.name}
            </div>
          </div>
        </div>
      ) : null}

      {second ? (
        <div className="absolute left-10 right-6 top-16 z-20 h-[300px] -rotate-[2deg] overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#0b1120] shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-blue-500/15 text-[9px] font-bold text-blue-300">
                {storefrontInitials(second.name)}
              </div>
              <div className="line-clamp-1 text-xs font-medium text-white/85">
                {second.name}
              </div>
            </div>
            <div className="size-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="relative h-32">
            <PreviewArt storefront={second} />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-[11px] text-white/50">
              {second.productCount} products
            </div>
            <div className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/70">
              Open
            </div>
          </div>
        </div>
      ) : null}

      <div className="absolute bottom-0 left-0 z-30 w-[86%] overflow-hidden rounded-[1.6rem] border border-white/15 bg-[#0c1324] shadow-[0_36px_100px_-24px_rgba(0,0,0,0.9)]">
        <div className="relative h-40 overflow-hidden">
          <PreviewArt storefront={featured} />
          <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/35 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
              <SparklesIcon size={12} className="text-blue-300" />
              Featured storefront
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/35 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
              <PackageIcon size={12} />
              {featured.productCount}
            </div>
          </div>
          <div className="absolute inset-x-4 bottom-3 rounded-xl bg-slate-950/80 px-3 py-2 backdrop-blur">
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/55">
              {featured.vendor?.businessName || 'Independent vendor'}
            </div>
            <div className="mt-0.5 text-lg font-semibold text-white">
              {featured.name}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-white/55">
            <StoreIcon size={14} />
            {featured.productCount} products
          </div>
          <Link
            href={`/store/${featured.slug}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-300 transition-colors hover:text-blue-200"
          >
            Visit
            <ArrowUpRightIcon size={14} />
          </Link>
        </div>
      </div>

      <div className="absolute -right-2 top-4 z-30 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-medium text-emerald-300 backdrop-blur">
        <BadgeCheckIcon size={14} />
        Verified vendors
      </div>
    </div>
  )
}

export function PublicStorefrontsListing({
  initial,
  initialQuery,
  initialError = false,
}: {
  initial: PublicStorefrontListResult
  initialQuery: StorefrontListingQuery
  initialError?: boolean
}) {
  const [storefronts, setStorefronts] = useState(initial.storefronts)
  const [pagination, setPagination] = useState(initial.pagination)
  // Keep the hero showcase stable while the listing is searched or sorted.
  const [heroStorefronts] = useState(() => initial.storefronts.slice(0, 3))
  const [heroTotal] = useState(initial.pagination.total)
  const [searchInput, setSearchInput] = useState(initialQuery.search)
  const [search, setSearch] = useState(initialQuery.search)
  const [sort, setSort] = useState<StorefrontSort>(initialQuery.sort)
  const [page, setPage] = useState(initialQuery.page)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    initialError ? 'Storefronts are temporarily unavailable.' : null
  )

  const abortRef = useRef<AbortController | null>(null)
  const firstRender = useRef(true)
  const firstSearchRender = useRef(true)

  useEffect(() => {
    if (firstSearchRender.current) {
      firstSearchRender.current = false
      return
    }
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(
    () => () => {
      abortRef.current?.abort()
    },
    []
  )

  const load = useCallback(
    async (targetPage = page) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)
      setError(null)

      try {
        const params = sortParams(sort)
        const result = await publicStorefrontApi.list(
          {
            page: targetPage,
            limit: PAGE_SIZE,
            search: search || undefined,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
          },
          controller.signal
        )
        setStorefronts(result.storefronts)
        setPagination(result.pagination)
        setPage(result.pagination.page)

        const query = new URLSearchParams()
        if (result.pagination.page > 1) {
          query.set('page', String(result.pagination.page))
        }
        if (search) query.set('search', search)
        if (sort !== 'newest') query.set('sort', sort)
        const qs = query.toString()
        window.history.replaceState(null, '', `/storefronts${qs ? `?${qs}` : ''}`)
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === 'AbortError') {
          return
        }
        setError(
          caught instanceof PublicStorefrontApiError
            ? caught.message
            : 'We could not load storefronts right now.'
        )
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    },
    [page, search, sort]
  )

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    void load()
  }, [load])

  const resetFilters = () => {
    setSearchInput('')
    setSearch('')
    setSort('newest')
    setPage(1)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  const applySearch = () => {
    setSearch(searchInput.trim())
    setPage(1)
  }

  const hasFilters = Boolean(search) || sort !== 'newest'
  const pages = Math.max(1, pagination.pages)

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > pages || nextPage === page) return
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar onDark />

      <section className="relative overflow-hidden border-b border-white/10 bg-[#05070d] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={STOREFRONT_PATTERN_STYLE}
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-36 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-8">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-blue-300">
              <StoreIcon size={14} />
              The 85Gifts marketplace
            </div>

            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.6rem]">
              Gifts worth giving,
              <span className="block text-blue-400">
                from makers worth knowing.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Explore independent storefronts curated by trusted vendors. Find
              something thoughtful, choose your options, and check out securely.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
              <div className="inline-flex items-center gap-1.5">
                <StoreIcon size={14} className="text-blue-400" />
                {heroTotal}{' '}
                {heroTotal === 1 ? 'storefront' : 'storefronts'} live
              </div>
              <div className="inline-flex items-center gap-1.5">
                <ShieldCheckIcon size={14} className="text-emerald-400" />
                Secure Paystack checkout
              </div>
              <div className="inline-flex items-center gap-1.5">
                <BadgeCheckIcon size={14} className="text-sky-400" />
                Vendor fulfilled
              </div>
            </div>
          </div>

          <HeroShowcase storefronts={heroStorefronts} />
        </div>
      </section>

      <main
        id="storefronts"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
      >
        <div className="border-b pb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
            Browse the marketplace
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Independent storefronts
          </h2>
          <div className="mt-1.5 text-sm text-muted-foreground">
            {loading ? (
              <div className="inline-flex items-center gap-1.5">
                <LoaderCircleIcon size={14} className="animate-spin" />
                Updating results…
              </div>
            ) : (
              `${pagination.total} ${
                pagination.total === 1 ? 'storefront' : 'storefronts'
              } found`
            )}
            {search ? ` for “${search}”` : ''}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              applySearch()
            }}
            className="min-w-0 flex-1"
          >
            <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-1 transition-colors focus-within:ring-2 focus-within:ring-blue-500/20">
              <SearchIcon
                size={16}
                className="ml-2 hidden shrink-0 text-muted-foreground sm:block"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                maxLength={200}
                placeholder="Search storefronts or gifts"
                aria-label="Search storefronts"
                className="h-9 min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground sm:pl-0 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Clear search"
                >
                  <XIcon size={16} />
                </button>
              ) : null}
              <button
                type="submit"
                aria-label="Search"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <span className="hidden sm:inline">Search</span>
                <SearchIcon size={16} className="sm:hidden" />
              </button>
            </div>

            {search ? (
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-xs text-muted-foreground">
                <SearchIcon
                  size={12}
                  className="text-blue-600 dark:text-blue-400"
                />
                <span>Showing results for</span>
                <span className="font-medium text-foreground">“{search}”</span>
                <span aria-hidden="true">·</span>
                <span>
                  {pagination.total}{' '}
                  {pagination.total === 1 ? 'storefront' : 'storefronts'}
                </span>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="font-medium text-blue-600 transition-colors hover:underline dark:text-blue-400"
                >
                  Clear
                </button>
              </div>
            ) : null}
          </form>

          <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
            {hasFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <RotateCcwIcon size={14} />
                Reset
              </button>
            ) : null}
            <Select
              value={sort}
              onValueChange={(value) => {
                setSort(value as StorefrontSort)
                setPage(1)
              }}
            >
              <SelectTrigger
                aria-label="Sort storefronts"
                className="h-9 w-[10.75rem] gap-2 rounded-lg border-0 bg-muted/50 px-3 text-xs font-medium shadow-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-blue-500/25 dark:bg-muted/50 dark:hover:bg-muted"
              >
                <SlidersHorizontalIcon
                  size={14}
                  className="shrink-0 text-muted-foreground"
                />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent
                align="end"
                sideOffset={6}
                className="min-w-[11rem] border-border bg-popover"
              >
                <SelectGroup>
                  <SelectLabel className="px-2 pb-1 pt-1.5 text-[10px] font-medium uppercase tracking-[0.14em]">
                    Sort storefronts
                  </SelectLabel>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="py-2 pl-2.5 pr-8 text-xs data-[state=checked]:bg-blue-500/10 data-[state=checked]:font-semibold data-[state=checked]:text-blue-700 focus:bg-blue-500/10 focus:text-foreground dark:data-[state=checked]:text-blue-300"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6">
          {error ? (
            <div className="rounded-[1.6rem] border border-dashed bg-card p-12 text-center">
              <PackageSearchIcon size={40} className="mx-auto mb-3 text-muted-foreground" />
              <h2 className="text-lg font-semibold">
                Storefronts are unavailable
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {error}
              </p>
              <Button className="mt-5" onClick={() => void load()}>
                <RotateCcwIcon size={16} />
                Try again
              </Button>
            </div>
          ) : loading && storefronts.length === 0 ? (
            <ListingSkeleton />
          ) : storefronts.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed bg-card p-12 text-center">
              <StoreIcon size={40} className="mx-auto mb-3 text-muted-foreground" />
              <h2 className="text-lg font-semibold">
                {search
                  ? `No storefronts match “${search}”`
                  : hasFilters
                    ? 'No storefronts match your filters'
                    : 'No storefronts yet'}
              </h2>
              <div className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {search
                  ? 'Try a shorter keyword, like “gift”, “leather”, or “candle”.'
                  : hasFilters
                    ? 'Reset the filters to see all storefronts.'
                    : 'Published vendor storefronts will appear here as soon as they go live.'}
              </div>
              {hasFilters ? (
                <Button variant="outline" className="mt-5" onClick={resetFilters}>
                  <RotateCcwIcon size={16} />
                  Reset filters
                </Button>
              ) : null}
            </div>
          ) : (
            <div
              aria-busy={loading}
              className={`grid grid-cols-1 gap-5 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${
                loading ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              {storefronts.map((storefront) => (
                <StorefrontCard key={storefront.slug} storefront={storefront} />
              ))}
            </div>
          )}
        </div>

        {pages > 1 && !error ? (
          <nav
            className="mt-12 flex flex-wrap items-center justify-center gap-1.5"
            aria-label="Storefront pagination"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || loading}
              aria-label="Previous page"
            >
              <ArrowLeftIcon size={16} />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {pageNumbers(page, pages).map((number) => (
              <Button
                key={number}
                variant={number === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => goToPage(number)}
                disabled={loading}
                aria-current={number === page ? 'page' : undefined}
                className="min-w-9"
              >
                {number}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= pages || loading}
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ArrowRightIcon size={16} />
            </Button>
          </nav>
        ) : null}

        <div className="mt-14 flex flex-col items-start justify-between gap-4 rounded-[1.6rem] border bg-blue-500/[0.06] p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-sm font-semibold">Have something worth gifting?</p>
            <p className="mt-1 max-w-lg text-sm text-muted-foreground">
              Open your own storefront and put your products in front of buyers
              looking for something thoughtful.
            </p>
          </div>
          <Link
            href="/login?tab=signup"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            Start selling
            <ArrowUpRightIcon size={16} />
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
