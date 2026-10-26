import Link from 'next/link'
import { ArrowUpRightIcon, PackageIcon, StoreIcon } from '@animateicons/react/lucide'
import { cssBackgroundImage } from '@/lib/backgroundImage'
import {
  storefrontAccent,
  storefrontInitials,
} from '@/lib/storefrontVisuals'
import type { PublicStorefrontListItem } from '@/app/types/publicStorefront'

function StorefrontArt({
  storefront,
}: {
  storefront: PublicStorefrontListItem
}) {
  const banner = storefront.displaySettings?.banner
  if (banner) {
    return (
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
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
      <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-[11rem] font-bold leading-none text-white/[0.07]">
        {storefrontInitials(storefront.name).slice(0, 1)}
      </div>
      <div className="absolute inset-4 rounded-2xl border border-white/15" />
      <StoreIcon size={20} className="absolute right-5 top-5 text-white/30" />
    </div>
  )
}

export function StorefrontCard({
  storefront,
}: {
  storefront: PublicStorefrontListItem
}) {
  const vendorName =
    storefront.vendor?.businessName ||
    storefront.vendor?.name ||
    'Independent vendor'
  const productLabel = `${storefront.productCount} ${
    storefront.productCount === 1 ? 'product' : 'products'
  }`

  return (
    <div className="group relative h-full">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[1.6rem] bg-blue-500/10 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-1.5 group-hover:opacity-100"
      />

      <Link
        href={`/store/${storefront.slug}`}
        className="relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border bg-card transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:border-blue-500/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <StorefrontArt storefront={storefront} />

          <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <PackageIcon size={12} />
            {productLabel}
          </div>

          <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/15 bg-slate-950/80 p-3 backdrop-blur-md">
            <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/65">
              <span className="flex size-5 items-center justify-center rounded-full border border-white/25 bg-white/10 text-[9px] font-bold text-white">
                {storefrontInitials(storefront.name)}
              </span>
              {vendorName}
            </p>
            <h2 className="mt-1 line-clamp-1 text-xl font-semibold leading-tight tracking-tight text-white sm:text-[1.35rem]">
              {storefront.name}
            </h2>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
            {storefront.description ||
              'A handpicked collection of gifts from an independent vendor.'}
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
            <span className="truncate font-mono text-[11px] text-muted-foreground">
              /store/{storefront.slug}
            </span>
            <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
              Explore
              <div className="flex size-7 items-center justify-center rounded-full border border-blue-500/25 bg-blue-500/10 transition-all duration-300 group-hover:border-blue-500/50 group-hover:bg-blue-500/20">
                <ArrowUpRightIcon size={14} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
