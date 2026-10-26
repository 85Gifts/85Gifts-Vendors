import Link from 'next/link'
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  CircleCheckBigIcon,
  ClockIcon,
  MailIcon,
  ShieldCheckIcon,
  StoreIcon,
} from '@animateicons/react/lucide'
import { PublicFooter } from '@/components/public-footer'
import { PublicNavbar } from '@/components/public-navbar'
import { formatNaira } from '@/lib/currency'
import { STOREFRONT_PATTERN_STYLE } from '@/lib/storefrontVisuals'

export function OrderStatusView({
  status,
  reference,
  storefrontSlug,
  amount,
}: {
  status: 'success' | 'received' | 'pending'
  reference?: string
  storefrontSlug?: string
  amount?: number
}) {
  const isSuccess = status === 'success'
  const isReceived = status === 'received'
  const heading = isSuccess
    ? 'Order placed successfully'
    : isReceived
      ? 'Payment received'
      : 'We are confirming your order'
  const description = isSuccess
    ? 'Your order has been created. Keep the reference below — you will also receive a confirmation email.'
    : isReceived
      ? 'Paystack has sent you back to us. We are confirming the payment and will email you as soon as it clears.'
      : 'We have received your payment reference. Your order will be confirmed once payment verification completes.'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar onDark />
      <main className="relative overflow-hidden bg-[#05070d] pb-20 pt-28 text-white sm:pb-28 sm:pt-36">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={STOREFRONT_PATTERN_STYLE}
          aria-hidden="true"
       />

        <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
          <div className="text-center">
            <div
              className={`mx-auto flex size-16 items-center justify-center rounded-2xl border shadow-2xl ${
                isSuccess || isReceived
                  ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300 shadow-emerald-950/40'
                  : 'border-amber-400/25 bg-amber-500/10 text-amber-300 shadow-amber-950/40'
              }`}
            >
              {isSuccess || isReceived ? (
                <CircleCheckBigIcon size={32} />
              ) : (
                <ClockIcon size={32} />
              )}
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              {heading}
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
              {description}
            </p>
          </div>

          {reference ? (
            <div className="mt-8 overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04]">
              <div className="border-b border-white/10 p-5 sm:p-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  Order reference
                </p>
                <p className="mt-2 break-all font-mono text-lg font-semibold text-white sm:text-xl">
                  {reference}
                </p>
              </div>
              {typeof amount === 'number' && Number.isFinite(amount) ? (
                <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
                  <span className="text-sm text-slate-400">Order total</span>
                  <span className="text-xl font-bold">
                    {amount > 0 ? formatNaira(amount) : 'Free order'}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left text-xs leading-relaxed text-slate-400">
            <MailIcon size={16} className="mt-0.5 shrink-0 text-blue-400" />
            <span>
              A confirmation email will be sent to the address you provided at
              checkout. If you do not see it, check your spam folder.
            </span>
          </div>

          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
            {storefrontSlug ? (
              <Link
                href={`/store/${storefrontSlug}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
              >
                <StoreIcon size={16} />
                Back to storefront
                <ArrowUpRightIcon size={16} />
              </Link>
            ) : null}
            <Link
              href="/storefronts"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 text-sm font-medium text-white/85 transition-colors hover:border-white/30 hover:text-white"
            >
              <ArrowLeftIcon size={16} />
              Browse storefronts
            </Link>
          </div>

          <div className="mt-6 inline-flex w-full items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheckIcon size={14} className="text-emerald-400" />
            Payments secured by Paystack
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
