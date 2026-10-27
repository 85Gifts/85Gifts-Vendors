import type { Metadata } from 'next'
import { OrderStatusView } from '@/components/storefronts/public/OrderStatusView'

export const metadata: Metadata = {
  title: 'Payment confirmation | 85Gifts',
  description: 'Confirming your 85Gifts storefront payment.',
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function OrderCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{
    reference?: string
    trxref?: string
    storefront?: string
  }>
}) {
  const query = await searchParams
  const reference = first(query.reference) || first(query.trxref)

  return (
    <OrderStatusView
      status={reference ? 'received' : 'pending'}
      reference={reference}
      storefrontSlug={first(query.storefront)}
    />
  )
}
