'use client';

import { useState } from 'react';
import InventoryDashboard from '@/components/InventoryDashboard';
import InventoryList from '@/components/InventoryList';
import StockAdjustmentModal from '@/components/StockAdjustmentModal';
import { Package, BarChart3 } from 'lucide-react';

interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
}

export default function InventoryPage() {
  const [activeView, setActiveView] = useState<'dashboard' | 'list'>('dashboard');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowAdjustmentModal(true);
  };

  const handleAdjustmentComplete = () => {
    setShowAdjustmentModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            Inventory Management
          </h1>
          <p className="mt-2 text-gray-600">Manage your product inventory, track stock levels, and monitor movements</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeView === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeView === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
      </div>
    </div>
  );
}
