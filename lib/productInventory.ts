export interface ProductInventorySummary {
  totalQuantity: number
  reservedQuantity: number
  availableQuantity: number
  sellingPrice: number
  status: string
  itemCount: number
}

export interface ProductMutationResult {
  product: any
  inventories: any[]
  inventory?: ProductInventorySummary
}

function inner(data: any): any {
  return data?.data ?? data
}

/** Create/update envelope: { success, data: { product, inventories, inventory } } */
export function unwrapProductMutation(data: any): ProductMutationResult {
  const payload = inner(data)
  return {
    product: payload?.product ?? payload,
    inventories: Array.isArray(payload?.inventories) ? payload.inventories : [],
    inventory: payload?.inventory,
  }
}

/** List envelope: { success, data: { products: [...] } } */
export function unwrapProductList(data: any): any[] {
  const payload = inner(data)
  if (Array.isArray(payload?.products)) return payload.products
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload)) return payload
  return []
}

export function productPrice(raw: any): number {
  const sellingPrice = raw?.inventory?.sellingPrice
  if (typeof sellingPrice === 'number' && Number.isFinite(sellingPrice)) {
    return sellingPrice
  }
  const price = Number(raw?.price)
  return Number.isFinite(price) ? price : 0
}

export function productStock(raw: any): number {
  const available = raw?.inventory?.availableQuantity
  if (typeof available === 'number' && Number.isFinite(available)) {
    return available
  }
  const total = raw?.inventory?.totalQuantity
  if (typeof total === 'number' && Number.isFinite(total)) {
    return total
  }
  const stock = Number(raw?.stock)
  return Number.isFinite(stock) ? stock : 0
}

export function productStatus(
  raw: any
): 'active' | 'out_of_stock' | 'inactive' {
  const inventoryStatus = String(raw?.inventory?.status || '').toLowerCase()
  if (inventoryStatus === 'out_of_stock') return 'out_of_stock'
  if (inventoryStatus === 'inactive' || inventoryStatus === 'discontinued') {
    return 'inactive'
  }

  const stock = productStock(raw)
  if (stock === 0) return 'out_of_stock'
  if (stock < 0) return 'inactive'
  return 'active'
}
