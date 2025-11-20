'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { Product } from '@/types/product';



interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock?: number;
  images?: string;
}


export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete product');
      }

      // Remove from state
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-100 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Products</h2>
        <button
          onClick={() => router.push('/products/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add New Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No products yet</p>
          <button
            onClick={() => router.push('/products/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
              {product.images && product.images.length > 0 && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              
              <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-blue-600">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  Stock: {product.stock}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/products/edit/${product.id}`)}
                  className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => product.id && handleDelete(product.id)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700"
                      disabled={!product.id}
                  >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
