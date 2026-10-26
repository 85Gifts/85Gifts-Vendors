const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatNaira(amount: number): string {
  return nairaFormatter.format(Number.isFinite(amount) ? amount : 0)
}
