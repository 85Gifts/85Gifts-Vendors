'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { Product } from '@/types/product';

interface ProductFormProps {
  product?: Product | null;
  isEdit?: boolean;
  onclose: () => void;
}

interface FormData {
  vendorId: string;
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  images: string;
}



interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock?: number;
  images?: string;
}




export default function ProductForm({ product = null, isEdit = false, onclose}: ProductFormProps) {
  const [formData, setFormData] = useState<FormData>({
    vendorId: '',
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price?.toString() || '',
    stock: product?.stock?.toString() || '',
    images: product?.images || '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Fetch vendor ID from localStorage on component mount
  useEffect(() => {
    const getVendorId = () => {
      // Try localStorage first
      const vendorId = localStorage.getItem('vendorId');
      if (vendorId) {
        setFormData(prev => ({ ...prev, vendorId }));
        return;
      }
      
      // Fallback to cookies if localStorage is not available
      const cookies = document.cookie.split(';');
      const vendorIdCookie = cookies.find(cookie => cookie.trim().startsWith('vendorId='));
      if (vendorIdCookie) {
        const id = vendorIdCookie.split('=')[1];
        setFormData(prev => ({ ...prev, vendorId: id }));
      }
    };
    
    getVendorId();
  }, []);

  // Update form data when product prop changes (for editing)
  useEffect(() => {
    if (product && isEdit) {
      setFormData({
        vendorId: formData.vendorId, // Keep existing vendorId
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        images: product.images || '',
      });
    }
  }, [product, isEdit]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files;
  //   if (files) {
  //     const filesArray = Array.from(files);
  //     if (filesArray.length > 5) {
  //       setError('Maximum 5 images allowed');
  //       return;
  //     }
  //     setImages(filesArray);
  //   }
  // };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Get vendorId from localStorage or cookies if not in formData
    let vendorId = formData.vendorId;
    if (!vendorId) {
      vendorId = localStorage.getItem('vendorId') || 
        document.cookie.split(';').find(c => c.trim().startsWith('vendorId='))?.split('=')[1] || '';
      if (!vendorId) {
        setError('Vendor ID not found. Please log in again.');
        setLoading(false);
        return;
      }
    }

    try {
      // Convert images string to array (split by comma or newline, filter empty strings)
      const imagesArray = formData.images
        ? formData.images
            .split(/[,\n]/)
            .map(url => url.trim())
            .filter(url => url.length > 0)
        : [];

      // Prepare JSON payload matching the backend API format
      const payload = {
        id: product?.id,
        vendorId: vendorId,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price), // Convert to number
        stock: parseInt(formData.stock, 10), // Convert to number
        images: imagesArray, // Array of image URLs
      };

      console.log('=== PRODUCTFORM DEBUG ===');
      console.log('isEdit:', isEdit);
      console.log('product:', product);
      console.log('product?.id:', product?.id);

      const url = isEdit 
        ? `/api/productId` 
        : '/api/products';
      
      const method = isEdit ? 'PUT' : 'POST';

      console.log('URL to call:', url);
      console.log('Method:', isEdit ? 'PUT' : 'POST');

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json', // Send as JSON
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Operation failed');
      }

      // Close the modal first
      onclose();
      
      // Refresh the page data to show the new product
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
      <button
        onClick={onclose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

      <h2 className="text-2xl font-bold mb-6 text-center">
        {isEdit ? "Edit Product" : "Add New Product"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Product Images (Max 5)
          </label>
          {/* <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full px-3 py-2 border rounded-md"
            />
            {images.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
              {images.length} image(s) selected
              </p>
              )} */}
          <input
            id="coverImageUrl"
            name="images"
            value={formData.images}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onclose}
            className="flex-1 border border-gray-300 rounded-md py-2 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
              ? "Update Product"
              : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

}
