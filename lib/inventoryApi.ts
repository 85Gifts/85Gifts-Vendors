export async function getInventory(productId?: string): Promise<{ success: boolean; data: any[]; total: number }> {
  const url = `/api/inventory${productId ? `?productId=${productId}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch inventory');
  }

  return response.json();
}

export async function getInventorySummary(): Promise<{ success: boolean; data: any }> {
  const response = await fetch('/api/inventory/summary');

  if (!response.ok) {
    throw new Error('Failed to fetch summary');
  }

  return response.json();
}

export async function getLowStockItems(): Promise<{ success: boolean; data: any[]; total: number }> {
  const response = await fetch('/api/inventory/low-stock');

  if (!response.ok) {
    throw new Error('Failed to fetch low stock items');
  }

  return response.json();
}

export async function getOutOfStockItems(): Promise<{ success: boolean; data: any[]; total: number }> {
  const response = await fetch('/api/inventory/out-of-stock');

  if (!response.ok) {
    throw new Error('Failed to fetch out of stock items');
  }

  return response.json();
}

export async function getInventoryById(id: string): Promise<{ success: boolean; data: any }> {
  const response = await fetch(`/api/inventory/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch inventory item');
  }

  return response.json();
}

export async function createInventory(data: any): Promise<{ success: boolean; data: any }> {
  const response = await fetch('/api/inventory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create inventory');
  }

  return response.json();
}

export async function updateInventory(id: string, data: any): Promise<{ success: boolean; data: any }> {
  const response = await fetch(`/api/inventory/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update inventory');
  }

  return response.json();
}

export async function deleteInventory(id: string): Promise<{ success: boolean; data: any }> {
  const response = await fetch(`/api/inventory/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete inventory');
  }

  return response.json();
}

export async function updateStock(
  id: string,
  quantity: number,
  operation: 'add' | 'subtract' | 'set' = 'set'
): Promise<{ success: boolean; data: any }> {
  const response = await fetch(`/api/inventory/${id}/stock`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity, operation }),
  });

  if (!response.ok) {
    throw new Error('Failed to update stock');
  }

  return response.json();
}

export async function reserveStock(id: string, quantity: number): Promise<{ success: boolean; data: any }> {
  const response = await fetch(`/api/inventory/${id}/reserve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok) {
    throw new Error('Failed to reserve stock');
  }

  return response.json();
}

export async function releaseStock(
  id: string,
  quantity: number,
  decreaseStock: boolean = false
): Promise<{ success: boolean; data: any }> {
  const response = await fetch(`/api/inventory/${id}/release`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity, decreaseStock }),
  });

  if (!response.ok) {
    throw new Error('Failed to release stock');
  }

  return response.json();
}

export function getStockStatus(quantity: number, reserved: number, lowStockThreshold: number = 10): 'in-stock' | 'low-stock' | 'out-of-stock' {
  const available = quantity - reserved;
  if (available === 0) return 'out-of-stock';
  if (available <= lowStockThreshold) return 'low-stock';
  return 'in-stock';
}

export function getStockStatusColor(status: string): string {
  switch (status) {
    case 'in-stock':
      return 'text-green-600 bg-green-100';
    case 'low-stock':
      return 'text-yellow-600 bg-yellow-100';
    case 'out-of-stock':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getStockStatusLabel(status: string): string {
  switch (status) {
    case 'in-stock':
      return 'In Stock';
    case 'low-stock':
      return 'Low Stock';
    case 'out-of-stock':
      return 'Out of Stock';
    default:
      return 'Unknown';
  }
}
