export type PublicProduct = {
  inventoryId: string
  name: string
  quantity: number
  price: number
  total: number
}

export type PublicInventoryLink = {
  _id: string
  linkCode: string
  title: string
  amount: number
  items: PublicProduct[]
  isActive: boolean
  currentUses: number
  customerInfoRequired: boolean
  createdAt: string
  updatedAt: string
}
