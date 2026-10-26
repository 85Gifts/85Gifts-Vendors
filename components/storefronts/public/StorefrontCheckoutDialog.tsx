'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CircleAlertIcon,
  LoaderCircleIcon,
  LockIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
} from '@animateicons/react/lucide'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatNaira } from '@/lib/currency'
import {
  PublicStorefrontApiError,
  publicStorefrontApi,
} from '@/lib/publicStorefrontApi'
import {
  cartCount,
  cartSubtotal,
  type StorefrontCartItem,
} from '@/lib/storefrontCart'
import type {
  PublicStorefront,
  StorefrontOrderResult,
} from '@/app/types/publicStorefront'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface CheckoutForm {
  name: string
  email: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  country: string
  postalCode: string
}

const EMPTY_FORM: CheckoutForm = {
  name: '',
  email: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  country: 'Nigeria',
  postalCode: '',
}

function errorText(error: unknown): string {
  if (error instanceof PublicStorefrontApiError) {
    if (error.status === 429) {
      return 'Too many checkout attempts. Please wait a moment and try again.'
    }
    if (error.status === 404) {
      return 'This storefront is no longer available. Please return to the storefront list.'
    }
    if (error.status === 409) {
      return error.message || 'One of the items no longer has enough stock.'
    }
    return error.message
  }
  return 'We could not place your order. Please try again.'
}

export function StorefrontCheckoutDialog({
  open,
  onOpenChange,
  storefront,
  items,
  onOrderCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  storefront: PublicStorefront
  items: StorefrontCartItem[]
  onOrderCreated: (order: StorefrontOrderResult) => void
}) {
  const router = useRouter()
  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subtotal = useMemo(() => cartSubtotal(items), [items])
  const count = useMemo(() => cartCount(items), [items])

  useEffect(() => {
    if (open) setError(null)
  }, [open])

  const update = (field: keyof CheckoutForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const validate = (): string | null => {
    const name = form.name.trim()
    const email = form.email.trim()
    if (!name) return 'Enter the customer name.'
    if (name.length > 200) return 'Customer name must be 200 characters or fewer.'
    if (!email) return 'Enter an email address for the order confirmation.'
    if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.'
    if (form.phone.trim().length > 50) {
      return 'Phone number must be 50 characters or fewer.'
    }
    if (items.length === 0) return 'Your cart is empty.'
    if (items.length > 30) return 'An order can contain at most 30 items.'

    const hasAddressInput = [
      form.line1,
      form.line2,
      form.city,
      form.state,
      form.postalCode,
    ].some((value) => value.trim().length > 0)

    if (hasAddressInput) {
      if (!form.line1.trim()) return 'Enter the delivery address.'
      if (!form.city.trim()) return 'Enter the delivery city.'
      if (!form.state.trim()) return 'Enter the delivery state.'
    }

    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      const hasAddressInput = [
        form.line1,
        form.line2,
        form.city,
        form.state,
        form.postalCode,
      ].some((value) => value.trim().length > 0)

      const order = await publicStorefrontApi.createOrder(storefront.slug, {
        customer: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
        },
        deliveryAddress: hasAddressInput
          ? {
              line1: form.line1.trim(),
              line2: form.line2.trim() || undefined,
              city: form.city.trim() || undefined,
              state: form.state.trim() || undefined,
              country: form.country.trim() || undefined,
              postalCode: form.postalCode.trim() || undefined,
            }
          : undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          ...(item.variantSku ? { variantSku: item.variantSku } : {}),
        })),
        callbackUrl: `${window.location.origin}/order/callback?storefront=${encodeURIComponent(
          storefront.slug
        )}`,
      })

      if (!order.orderReference || order.orderReference === 'Unknown') {
        setError(
          'The order was created, but the confirmation reference is missing. Please contact the vendor before trying again.'
        )
        setSubmitting(false)
        return
      }

      if (order.paymentUrl) {
        onOrderCreated(order)
        window.location.assign(order.paymentUrl)
        return
      }

      const isCompleted =
        order.paymentStatus === 'completed' || order.totalAmount === 0

      if (!isCompleted) {
        setError(
          'The order was created, but payment could not be initialized. Please try again or contact the vendor.'
        )
        setSubmitting(false)
        return
      }

      onOrderCreated(order)
      const query = new URLSearchParams({
        status: 'success',
        storefront: storefront.slug,
        amount: String(order.totalAmount),
      })
      router.push(
        `/order/${encodeURIComponent(order.orderReference)}?${query.toString()}`
      )
    } catch (caught) {
      setError(errorText(caught))
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto p-4 sm:max-w-2xl sm:p-6">
        <DialogHeader>
          <DialogTitle asChild>
            <div className="flex items-center gap-2.5 pr-8">
              <div className="flex size-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <ShoppingBagIcon size={16} />
              </div>
              Checkout
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete your order from {storefront.name}. You will be redirected to
            Paystack if payment is required.
          </DialogDescription>
        </DialogHeader>

        <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] p-4">
          <div className="relative flex items-center justify-between gap-3 text-sm">
            <div className="inline-flex items-center gap-1.5 text-muted-foreground">
              <ShoppingBagIcon size={14} />
              {count} {count === 1 ? 'item' : 'items'}
            </div>
            <span className="text-base font-bold">{formatNaira(subtotal)}</span>
          </div>
          <ul className="relative mt-3 max-h-32 space-y-1.5 overflow-y-auto border-t border-blue-500/15 pt-3">
            {items.map((item) => (
              <li
                key={item.key}
                className="flex items-center justify-between gap-3 text-xs text-muted-foreground"
              >
                <span className="min-w-0 truncate">
                  {item.name}
                  {item.variantLabel ? ` · ${item.variantLabel}` : ''} ×{' '}
                  {item.quantity}
                </span>
                <span className="shrink-0 font-medium text-foreground">
                  {formatNaira(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex size-5 items-center justify-center rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                1
              </span>
              Customer details
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="checkout-name">Full name</Label>
                <Input
                  id="checkout-name"
                  value={form.name}
                  onChange={(event) => update('name', event.target.value)}
                  maxLength={200}
                  autoComplete="name"
                  placeholder="Jane Smith"
               />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="checkout-email">Email</Label>
                <Input
                  id="checkout-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => update('email', event.target.value)}
                  autoComplete="email"
                  placeholder="jane@example.com"
               />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="checkout-phone">Phone (optional)</Label>
                <Input
                  id="checkout-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  maxLength={50}
                  autoComplete="tel"
                  placeholder="+234 801 234 5678"
               />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex size-5 items-center justify-center rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  2
                </span>
                Delivery address
              </h3>
              <p className="mt-1 pl-7 text-xs text-muted-foreground">
                Optional for digital orders. Add an address if your items need
                shipping.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="checkout-line1">Address line 1</Label>
                <Input
                  id="checkout-line1"
                  value={form.line1}
                  onChange={(event) => update('line1', event.target.value)}
                  maxLength={200}
                  autoComplete="address-line1"
                  placeholder="123 Main Street"
               />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="checkout-line2">Address line 2 (optional)</Label>
                <Input
                  id="checkout-line2"
                  value={form.line2}
                  onChange={(event) => update('line2', event.target.value)}
                  maxLength={200}
                  autoComplete="address-line2"
                  placeholder="Apartment, suite, etc."
               />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="checkout-city">City</Label>
                <Input
                  id="checkout-city"
                  value={form.city}
                  onChange={(event) => update('city', event.target.value)}
                  maxLength={100}
                  autoComplete="address-level2"
                  placeholder="Lagos"
               />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="checkout-state">State</Label>
                <Input
                  id="checkout-state"
                  value={form.state}
                  onChange={(event) => update('state', event.target.value)}
                  maxLength={100}
                  autoComplete="address-level1"
                  placeholder="Lagos"
               />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="checkout-country">Country</Label>
                <Input
                  id="checkout-country"
                  value={form.country}
                  onChange={(event) => update('country', event.target.value)}
                  maxLength={100}
                  autoComplete="country-name"
               />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="checkout-postal">Postal code</Label>
                <Input
                  id="checkout-postal"
                  value={form.postalCode}
                  onChange={(event) => update('postalCode', event.target.value)}
                  maxLength={20}
                  autoComplete="postal-code"
                  placeholder="101001"
               />
              </div>
            </div>
          </section>

          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <CircleAlertIcon size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            <ShieldCheckIcon size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            <span>
              Payments are processed securely by Paystack. 85Gifts never sees
              your card details.
            </span>
          </div>

          <DialogFooter className="flex-row flex-wrap justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || items.length === 0}
              className="bg-blue-600 text-white hover:bg-blue-500"
            >
              {submitting ? (
                <LoaderCircleIcon size={16} className="animate-spin" />
              ) : (
                <LockIcon size={16} />
              )}
              {subtotal > 0
                ? `Pay ${formatNaira(subtotal)}`
                : 'Place free order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
