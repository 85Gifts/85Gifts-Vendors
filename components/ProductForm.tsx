'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uploadMultipleImagesToCloudinary, validateImageFile } from '@/lib/cloudinary';
import { X, Upload } from 'lucide-react';
// import { Product } from '@/types/product';

interface ProductFormProps {
  product?: Product | null;
  isEdit?: boolean;
  onclose: () => void;
  onSuccess?: () => void;
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




export default function ProductForm({ product = null, isEdit = false, onclose, onSuccess}: ProductFormProps) {
  const [formData, setFormData] = useState<FormData>({
    vendorId: '',
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price?.toString() || '',
    stock: product?.stock?.toString() || '',
    images: product?.images || '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<any>(null);
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
      
      // If product has existing images, set them as previews
      if (product.images) {
        const existingImages = typeof product.images === 'string' 
          ? product.images.split(/[,\n]/).filter(url => url.trim().length > 0)
          : Array.isArray(product.images) 
            ? product.images 
            : [];
        setUploadedImageUrls(existingImages);
        setImagePreviews(existingImages);
      }
    }
  }, [product, isEdit]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    
    // Check total images (existing + new)
    const totalImages = uploadedImageUrls.length + filesArray.length;
    if (totalImages > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    // Validate each file
    for (const file of filesArray) {
      const validationError = validateImageFile(file, 10);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Create previews for new files
    const newPreviews: string[] = [];
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === filesArray.length) {
          setImagePreviews([...uploadedImageUrls, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImageFiles([...imageFiles, ...filesArray]);
    setError('');
  };

  const removeImage = (index: number) => {
    // Remove from previews
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);

    // Remove from uploaded URLs if it's an existing image
    if (index < uploadedImageUrls.length) {
      const newUrls = [...uploadedImageUrls];
      newUrls.splice(index, 1);
      setUploadedImageUrls(newUrls);
    } else {
      // Remove from files array (adjust index)
      const fileIndex = index - uploadedImageUrls.length;
      const newFiles = [...imageFiles];
      newFiles.splice(fileIndex, 1);
      setImageFiles(newFiles);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setUploadingImages(true);

    // Get vendorId from localStorage or cookies if not in formData
    let vendorId = formData.vendorId;
    if (!vendorId) {
      vendorId = localStorage.getItem('vendorId') || 
        document.cookie.split(';').find(c => c.trim().startsWith('vendorId='))?.split('=')[1] || '';
      if (!vendorId) {
        setError('Vendor ID not found. Please log in again.');
        setLoading(false);
        setUploadingImages(false);
        return;
      }
    }

    try {
      let finalImageUrls: string[] = [...uploadedImageUrls];

      // Upload new image files to Cloudinary
      if (imageFiles.length > 0) {
        try {
          const uploadedUrls = await uploadMultipleImagesToCloudinary(imageFiles);
          finalImageUrls = [...finalImageUrls, ...uploadedUrls];
        } catch (uploadError) {
          setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload images');
          setLoading(false);
          setUploadingImages(false);
          return;
        }
      }

      // If no images uploaded and formData.images has URLs (fallback for manual entry)
      if (finalImageUrls.length === 0 && formData.images) {
        const imagesArray = formData.images
          .split(/[,\n]/)
          .map(url => url.trim())
          .filter(url => url.length > 0);
        finalImageUrls = imagesArray;
      }

      setUploadingImages(false);

      // Prepare JSON payload matching the backend API format
      const payload = {
        id: product?.id,
        vendorId: vendorId,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price), // Convert to number
        stock: parseInt(formData.stock, 10), // Convert to number
        images: finalImageUrls, // Array of Cloudinary image URLs
      };

      const url = isEdit 
        ? `/api/productId` 
        : '/api/products';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json', // Send as JSON
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Set validation errors if available
        if (data.validationErrors) {
          setValidationErrors(data.validationErrors);
        } else {
          setValidationErrors(null);
        }
        
        // Create detailed error message
        let errorMsg = data.error || data.message || 'Operation failed';
        
        // If we have validation errors, format them nicely
        if (data.validationErrors) {
          if (Array.isArray(data.validationErrors)) {
            errorMsg = 'Validation failed:\n' + data.validationErrors.map((err: any) => 
              `• ${err.message || err.msg || JSON.stringify(err)}`
            ).join('\n');
          } else if (typeof data.validationErrors === 'object') {
            errorMsg = 'Validation failed:\n' + Object.entries(data.validationErrors)
              .map(([field, msg]: [string, any]) => `• ${field}: ${msg.message || msg}`)
              .join('\n');
          }
        }
        
        throw new Error(errorMsg);
      }

      // Call onSuccess callback if provided (for refreshing data and showing toast)
      if (onSuccess) {
        onSuccess();
      }

      // Close the modal
      onclose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
      <button
        onClick={onclose}
        className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        ✕
      </button>

      <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">
        {isEdit ? "Edit Product" : "Add New Product"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
          <div className="font-semibold mb-2">Error:</div>
          <div className="whitespace-pre-wrap text-sm">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Product Images (Max 5)
          </label>
          
          {/* File input for uploading images */}
          <div className="mb-3">
            <label
              htmlFor="image-upload"
              className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <Upload className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {uploadingImages ? 'Uploading images...' : 'Click to upload images'}
              </span>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                disabled={uploadingImages || loading}
              />
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Supported formats: JPG, PNG, GIF, WebP. Max 10MB per image.
            </p>
          </div>

          {/* Image previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={uploadingImages || loading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Fallback: Manual URL input (optional) */}
          <div className="mt-3">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Or enter image URLs manually (comma-separated):
            </label>
            <input
              id="coverImageUrl"
              name="images"
              value={formData.images}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg, https://example.com/image2.jpg"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={imageFiles.length > 0 || uploadingImages || loading}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onclose}
            className="flex-1 border border-gray-300 dark:border-gray-700 dark:text-gray-300 rounded-md py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploadingImages
              ? "Uploading images..."
              : loading
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