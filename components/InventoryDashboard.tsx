'use client';

import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, Activity } from 'lucide-react';

interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  quantityChange: number;
  type: string;
  reason?: string;
  timestamp: string;
}

interface InventorySummary {
  totalItems: number;
  totalQuantity: number;
  totalReserved: number;
  totalAvailable: number;
  lowStockCount: number;
  outOfStockCount: number;
  averageStock: number;
}

export default function InventoryDashboard() {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
    fetchMovements();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/inventory/summary');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch summary');
      }

      setSummary(data.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'added':
      case 'restocked':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'sold':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'adjusted':
        return <Package className="w-4 h-4 text-orange-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Package className="w-6 h-6 text-blue-600" />
        Inventory Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-3xl font-bold text-gray-900">
                {summary?.totalItems || 0}
              </p>
            </div>
            <Package className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Stock</p>
              <p className="text-3xl font-bold text-gray-900">
                {summary?.totalQuantity || 0}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Alerts</p>
              <p className="text-3xl font-bold text-yellow-600">
                {summary?.lowStockCount || 0}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600">
                {summary?.outOfStockCount || 0}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>
      </div>

      {summary && summary.lowStockCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">Low Stock Warning</h4>
              <p className="text-sm text-yellow-700">
                You have {summary.lowStockCount} item(s) with low stock levels.
                Consider restocking soon to avoid stockouts.
              </p>
            </div>
          </div>
        </div>
      )}

      {summary && summary.outOfStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800">Out of Stock Alert</h4>
              <p className="text-sm text-red-700">
                You have {summary.outOfStockCount} item(s) out of stock.
                These products won't be available for purchase until restocked.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Reserved</p>
            <p className="text-2xl font-bold text-blue-900">{summary?.totalReserved || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Available Stock</p>
            <p className="text-2xl font-bold text-green-900">{summary?.totalAvailable || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Average Stock</p>
            <p className="text-2xl font-bold text-purple-900">{summary?.averageStock || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
