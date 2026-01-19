'use client';

import { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, XCircle, Edit, RefreshCw, ChevronLeft, ChevronRight, MoreVertical, ShoppingCart, Receipt, FileText, Link, PackageCheck } from 'lucide-react';
import { useCheckout } from '@/contexts/CheckoutContext';

interface InventoryProduct {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  inventory: {
    totalQuantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    itemCount: number;
    hasVariants: boolean;
    status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface InventoryListProps {
  onEdit?: (item: any) => void;
}

export default function InventoryList({ onEdit }: InventoryListProps) {
  const { addToCheckout } = useCheckout();
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filter, setFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [filter, categoryFilter, currentPage, searchTerm]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });

      if (filter !== 'all') {
        params.append('status', filter);
      }
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/inventory/products?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch inventory');
      }

      // Handle nested response structure
      const productsData = data?.data?.data?.products || data?.data?.products || [];
      const paginationData = data?.data?.data?.pagination || data?.data?.pagination;

      setProducts(productsData);
      setPagination(paginationData);

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(productsData.map((p: InventoryProduct) => p.category))).filter(Boolean) as string[];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (status: string) => {
    switch (status) {
      case 'in_stock':
        return { status: 'in_stock', label: 'In Stock', icon: CheckCircle };
      case 'low_stock':
        return { status: 'low_stock', label: 'Low Stock', icon: AlertTriangle };
      case 'out_of_stock':
        return { status: 'out_of_stock', label: 'Out of Stock', icon: XCircle };
      case 'discontinued':
        return { status: 'discontinued', label: 'Discontinued', icon: XCircle };
      default:
        return { status: 'in_stock', label: 'In Stock', icon: CheckCircle };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'low_stock': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'out_of_stock': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'discontinued': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleActionsClick = (product: InventoryProduct) => {
    setSelectedProduct(product);
    setIsActionsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsActionsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAction = (action: string) => {
    if (!selectedProduct) return;
    
    // Handle different actions
    switch (action) {
      case 'add-to-checkout':
        addToCheckout(selectedProduct);
        handleCloseModal();
        break;
      case 'generate-receipt':
        console.log('Generate receipt:', selectedProduct);
        // TODO: Implement generate receipt
        break;
      case 'generate-invoice':
        console.log('Generate invoice:', selectedProduct);
        // TODO: Implement generate invoice
        break;
      case 'generate-payment-link':
        console.log('Generate payment link:', selectedProduct);
        // TODO: Implement generate payment link
        break;
      case 'edit-stock':
        console.log('Edit stock:', selectedProduct);
        // TODO: Implement edit stock
        break;
      case 'edit-inventory':
        if (onEdit) {
          onEdit(selectedProduct);
        }
        handleCloseModal();
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold dark:text-white">Inventory</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchInventory}
            className="p-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearch}
          className="flex-1 px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as any);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="discontinued">Discontinued</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading inventory...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">No inventory items found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reserved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Available</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {products.map((product) => {
                    const { status, label, icon: StatusIcon } = getStockStatus(product.inventory.status);
                    return (
                      <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{product.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium dark:text-white">
                            ₦{product.price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium dark:text-white">{product.inventory.totalQuantity}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {product.inventory.reservedQuantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white">
                          {product.inventory.availableQuantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {product.inventory.itemCount}
                          {product.inventory.hasVariants && (
                            <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">(variants)</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleActionsClick(product)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                            title="Actions"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 border-t dark:border-gray-700 rounded-lg">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first page, last page, current page, and pages around current
                        return (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        );
                      })
                      .map((page, idx, arr) => {
                        // Add ellipsis if there's a gap
                        const showEllipsisBefore = idx > 0 && arr[idx - 1] !== page - 1;
                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsisBefore && (
                              <span className="relative inline-flex items-center px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm font-medium">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border dark:border-gray-700 text-sm font-medium ${
                                currentPage === page
                                  ? 'z-10 bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                                  : 'dark:bg-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Actions Modal */}
      {isActionsModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
              <div>
                <h3 className="text-xl font-semibold dark:text-white">Product Actions</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedProduct.name}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Actions Grid */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Add to Checkout */}
                <button
                  onClick={() => handleAction('add-to-checkout')}
                  className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex flex-col items-center justify-center gap-3"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <ShoppingCart className="w-8 h-8 relative z-10" />
                  <span className="font-semibold text-lg relative z-10">Add to Checkout</span>
                </button>

                {/* Generate Receipt */}
                <button
                  onClick={() => handleAction('generate-receipt')}
                  className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex flex-col items-center justify-center gap-3"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Receipt className="w-8 h-8 relative z-10" />
                  <span className="font-semibold text-lg relative z-10">Generate Receipt</span>
                </button>

                {/* Generate Invoice */}
                <button
                  onClick={() => handleAction('generate-invoice')}
                  className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex flex-col items-center justify-center gap-3"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <FileText className="w-8 h-8 relative z-10" />
                  <span className="font-semibold text-lg relative z-10">Generate Invoice</span>
                </button>

                {/* Generate Payment Link */}
                <button
                  onClick={() => handleAction('generate-payment-link')}
                  className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex flex-col items-center justify-center gap-3"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Link className="w-8 h-8 relative z-10" />
                  <span className="font-semibold text-lg relative z-10">Generate Payment Link</span>
                </button>

                {/* Edit Stock */}
                <button
                  onClick={() => handleAction('edit-stock')}
                  className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex flex-col items-center justify-center gap-3"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <PackageCheck className="w-8 h-8 relative z-10" />
                  <span className="font-semibold text-lg relative z-10">Edit Stock</span>
                </button>

                {/* Edit Inventory */}
                <button
                  onClick={() => handleAction('edit-inventory')}
                  className="group relative overflow-hidden bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex flex-col items-center justify-center gap-3"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Edit className="w-8 h-8 relative z-10" />
                  <span className="font-semibold text-lg relative z-10">Edit Inventory</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
