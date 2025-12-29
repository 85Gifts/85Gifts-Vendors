export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock?: number;
  image?: string;
  images?: string[];
  sku?: string;
  status?: 'active' | 'inactive' | 'draft';
  createdAt?: string;
  updatedAt?: string;
  lowStockThreshold?: number;
  lastStockUpdate?: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string | number;
  category: string;
  stock?: string | number;
  image?: File | null;
}

export interface InventoryMovement {
  id?: string;
  productId: string;
  productName: string;
  quantityChange: number;
  type: 'added' | 'sold' | 'adjusted' | 'restocked';
  reason?: string;
  timestamp: string;
  previousStock: number;
  newStock: number;
}

export interface InventoryStats {
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentMovements: InventoryMovement[];
}
