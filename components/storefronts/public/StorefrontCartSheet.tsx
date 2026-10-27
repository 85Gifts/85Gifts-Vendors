'use client'

import {
  GiftIcon,
  MinusIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  Trash2Icon,
} from '@animateicons/react/lucide'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cssBackgroundImage } from '@/lib/backgroundImage'
import { formatNaira } from '@/lib/currency'
import {
  cartCount,
  cartSubtotal,
  type StorefrontCartItem,
} from '@/lib/storefrontCart'

export function StorefrontCartSheet({
  open,
  onOpenChange,
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: StorefrontCartItem[]
  onUpdateQuantity: (key: string, quantity: number) => void
  onRemove: (key: string) => void
  onCheckout: () => void
}) {
  const subtotal = cartSubtotal(items)
  const count = cartCount(items)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 border-l border-white/10 bg-[#070b14] p-0 text-white [&>button]:text-white/60 [&>button]:hover:text-white sm:max-w-md"
      >
        <SheetHeader className="relative overflow-hidden border-b border-white/10 p-5 pr-12">

          <SheetTitle asChild>
            <div className="relative flex items-center gap-2.5 text-white">
              <div className="flex size-9 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/15 text-blue-300">
                <ShoppingBagIcon size={16} />
              </div>
              Your cart
              {count > 0 ? (
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {count}
                </span>
              ) : null}
            </div>
          </SheetTitle>
          <SheetDescription className="relative text-slate-400">
            Items from this storefront only. You can adjust quantities here.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {items.length === 0 ? (
            <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
              <div className="mb-3 flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <ShoppingBagIcon size={24} className="text-slate-500" />
              </div>
              <p className="font-medium">Your cart is empty</p>
              <p className="mt-1 max-w-xs text-sm text-slate-400">
                Add a product from this storefront to start your order.
              </p>
              <Button
                variant="outline"
                className="mt-5 border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={() => onOpenChange(false)}
              >
                Continue shopping
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.key}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3"
                >
                  {item.image ? (
                    <div
                      className="size-[4.5rem] shrink-0 rounded-xl bg-cover bg-center"
                      style={{ backgroundImage: cssBackgroundImage(item.image) }}
                      role="img"
                      aria-label={item.name}
                   />
                  ) : (
                    <div className="flex size-[4.5rem] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-blue-500/10 text-blue-300">
                      <GiftIcon size={24} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-medium">
                          {item.name}
                        </p>
                        {item.variantLabel ? (
                          <p className="mt-0.5 text-xs text-slate-400">
                            {item.variantLabel}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(item.key)}
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2Icon size={14} />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1 rounded-lg border border-white/10 p-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="text-slate-300 hover:bg-white/10 hover:text-white"
                          onClick={() =>
                            onUpdateQuantity(item.key, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <MinusIcon size={12} />
                        </Button>
                        <span className="w-7 text-center text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="text-slate-300 hover:bg-white/10 hover:text-white"
                          onClick={() =>
                            onUpdateQuantity(item.key, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.maxQuantity}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <PlusIcon size={12} />
                        </Button>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatNaira(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <SheetFooter className="border-t border-white/10 bg-white/[0.02] p-5">
            <div className="mb-2 rounded-xl border border-white/10 bg-white/[0.035] p-3.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-lg font-bold">{formatNaira(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Delivery details are collected at checkout.
              </p>
            </div>
            <Button
              className="h-11 w-full bg-blue-600 text-white hover:bg-blue-500"
              onClick={onCheckout}
            >
              <ShoppingBagIcon size={16} />
              Proceed to checkout
            </Button>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheckIcon size={14} className="text-emerald-400" />
              Secured by Paystack
            </div>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
