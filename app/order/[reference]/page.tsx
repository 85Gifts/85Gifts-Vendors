import type { Metadata } from 'next'
import { OrderStatusView } from '@/components/storefronts/public/OrderStatusView'

export const metadata: Metadata = {
  title: 'Order confirmation | 85Gifts',
  description: 'Your 85Gifts storefront order confirmation.',
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>
  searchParams: Promise<{
    status?: string
    storefront?: string
    amount?: string
  }>
}) {
  const { reference } = await params
  const query = await searchParams
  const amount = Number(first(query.amount))

  return (
    <OrderStatusView
      status={query.status === 'success' ? 'success' : 'pending'}
      reference={reference}
      storefrontSlug={first(query.storefront)}
      amount={Number.isFinite(amount) ? amount : undefined}
    />
  )
}
