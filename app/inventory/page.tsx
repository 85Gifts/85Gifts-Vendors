'use client';

import { useState } from 'react';
import InventoryDashboard from '@/components/InventoryDashboard';
import InventoryList from '@/components/InventoryList';
import StockAdjustmentModal from '@/components/StockAdjustmentModal';
import CheckoutModal from '@/components/CheckoutModal';
import { Package, BarChart3, ShoppingCart } from 'lucide-react';
import { useCheckout } from '@/contexts/CheckoutContext';

interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
}

export default function InventoryPage() {
  const { getTotalItems } = useCheckout();
  const [activeView, setActiveView] = useState<'dashboard' | 'list'>('dashboard');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const checkoutCount = getTotalItems();

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowAdjustmentModal(true);
  };

  const handleAdjustmentComplete = () => {
    setShowAdjustmentModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                Inventory Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your product inventory, track stock levels, and monitor movements</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowCheckoutModal(true)}
                className="relative p-3 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300 transition-colors"
                title="Checkout"
              >
                <ShoppingCart className="w-6 h-6" />
                {checkoutCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {checkoutCount > 99 ? '99+' : checkoutCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 mb-6">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeView === 'dashboard'
                  ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeView === 'list'
                  ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Package className="w-4 h-4" />
              All Items
            </button>
          </nav>
        </div>

        {activeView === 'dashboard' ? (
          <InventoryDashboard />
        ) : (
          <InventoryList onEdit={handleEditItem} />
        )}

        {showAdjustmentModal && selectedItem && (
          <StockAdjustmentModal
            isOpen={showAdjustmentModal}
            onClose={() => setShowAdjustmentModal(false)}
            item={selectedItem}
            onAdjustmentComplete={handleAdjustmentComplete}
          />
        )}

        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
        />
      </div>
    </div>
  );
}
