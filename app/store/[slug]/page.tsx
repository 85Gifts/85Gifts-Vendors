import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeftIcon, StoreIcon } from '@animateicons/react/lucide'
import { PublicFooter } from '@/components/public-footer'
import { PublicNavbar } from '@/components/public-navbar'
import { PublicStorefrontView } from '@/components/storefronts/public/PublicStorefrontView'
import { getPublicStorefront } from '@/lib/publicStorefrontServer'

const PRODUCTS_PER_PAGE = 12

function parsePage(value?: string): number {
  const page = Number(value)
  return Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1
}

function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const name = humanizeSlug(slug) || 'Storefront'
  return {
    title: `${name} | 85Gifts`,
    description: `Shop gifts and products from ${name} on 85Gifts. Secure checkout powered by Paystack.`,
  }
}

function StorefrontUnavailable() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />
      <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 pb-16 pt-28 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <StoreIcon size={32} className="text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Storefront unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not load this storefront right now. It may be temporarily
          offline or the link may be incorrect.
        </p>
        <Link
          href="/storefronts"
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowLeftIcon size={16} />
          Browse storefronts
        </Link>
      </main>
      <PublicFooter />
    </div>
  )
}

export default async function StorefrontPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const query = await searchParams
  const page = parsePage(query.page)

  let result
  try {
    result = await getPublicStorefront(slug, {
      page,
      limit: PRODUCTS_PER_PAGE,
    })
  } catch {
    return <StorefrontUnavailable />
  }

  if (!result) notFound()

  return (
    <PublicStorefrontView
      storefront={result.storefront}
      initialPagination={result.pagination}
   />
  )
}
