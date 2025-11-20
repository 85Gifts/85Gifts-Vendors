export interface Product {
  vendorId?: string
  name: string
  description: string
  category: string
  price: number
  stock: number
  images: string[]
  giftCategory?: string
  status?: "active" | "inactive" | "out_of_stock"
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string | number;
  category: string;
  stock?: string | number;
  image?: File | null;
}
