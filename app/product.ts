export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images?: string[];
  vendorId: string;
  createdAt: string;
  updatedAt: string;
}
