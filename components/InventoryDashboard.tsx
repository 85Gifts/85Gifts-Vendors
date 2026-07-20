'use client';

import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CardSpotlight } from '@/components/ui/card-spotlight';
import InventoryStockChart from '@/components/InventoryStockChart';

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
  inStock: number;
  lowStock: number;
  outOfStock: number;
  discontinued: number;
  totalValue: number;
  averageStockLevel: number;
  reorderNeeded: number;
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
      const response = await fetch('/api/inventory/summary', {
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch summary');
      }

      // Handle nested response structure: data.data.data
      const summaryData = data?.data?.data?.data || data?.data?.data || data?.data;
      setSummary(summaryData);
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
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
        <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        Inventory Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardSpotlight className="p-6" spotColor="rgba(59, 130, 246, 0.18)">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                {summary?.totalItems || 0}
              </p>
            </div>
            <span className="flex items-center justify-center rounded-lg bg-blue-500/10 p-2">
              <Package className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            </span>
          </div>
          <Badge variant="outline" className="mt-4 border-blue-500/30 text-blue-600 dark:text-blue-400">
            All inventory
          </Badge>
        </CardSpotlight>

        <CardSpotlight className="p-6" spotColor="rgba(34, 197, 94, 0.18)">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Stock</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                {summary?.inStock || 0}
              </p>
            </div>
            <span className="flex items-center justify-center rounded-lg bg-green-500/10 p-2">
              <TrendingUp className="w-6 h-6 text-green-500 dark:text-green-400" />
            </span>
          </div>
          <Badge variant="outline" className="mt-4 border-green-500/30 text-green-600 dark:text-green-400">
            Healthy
          </Badge>
        </CardSpotlight>

        <CardSpotlight className="p-6" spotColor="rgba(234, 179, 8, 0.18)">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock Alerts</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 tabular-nums">
                {summary?.lowStock || 0}
              </p>
            </div>
            <span className="flex items-center justify-center rounded-lg bg-yellow-500/10 p-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
            </span>
          </div>
          <Badge variant="outline" className="mt-4 border-yellow-500/30 text-yellow-600 dark:text-yellow-400">
            Needs attention
          </Badge>
        </CardSpotlight>

        <CardSpotlight className="p-6" spotColor="rgba(239, 68, 68, 0.18)">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                {summary?.outOfStock || 0}
              </p>
            </div>
            <span className="flex items-center justify-center rounded-lg bg-red-500/10 p-2">
              <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
            </span>
          </div>
          <Badge variant="outline" className="mt-4 border-red-500/30 text-red-600 dark:text-red-400">
            Critical
          </Badge>
        </CardSpotlight>
      </div>

      {summary && summary.lowStock > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Low Stock Warning</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                You have {summary.lowStock} item(s) with low stock levels.
                Consider restocking soon to avoid stockouts.
              </p>
            </div>
          </div>
        </div>
      )}

      {summary && summary.outOfStock > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-300">Out of Stock Alert</h4>
              <p className="text-sm text-red-700 dark:text-red-400">
                You have {summary.outOfStock} item(s) out of stock.
                 These products won&apos;t be available for purchase until restocked.
              </p>
            </div>
          </div>
        </div>
      )}

      {summary && summary.reorderNeeded > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-800 dark:text-orange-300">Reorder Needed</h4>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                You have {summary.reorderNeeded} item(s) that need to be reordered.
              </p>
            </div>
          </div>
        </div>
      )}

      <InventoryStockChart summary={summary} />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Additional Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-400">In Stock Items</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-300">{summary?.inStock || 0}</p>
            <Progress
              value={summary && summary.totalItems > 0 ? Math.round((summary.inStock / summary.totalItems) * 100) : 0}
              className="mt-3 bg-green-500/15 [&>div]:bg-green-500"
            />
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border dark:border-purple-800">
            <p className="text-sm text-purple-600 dark:text-purple-400">Average Stock Level</p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">{summary?.averageStockLevel || 0}</p>
            <Progress
              value={Math.min(100, summary?.averageStockLevel || 0)}
              className="mt-3 bg-purple-500/15 [&>div]:bg-purple-500"
            />
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border dark:border-blue-800">
            <p className="text-sm text-blue-600 dark:text-blue-400">Total Value</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
              {summary?.totalValue ? new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN',
                maximumFractionDigits: 0,
              }).format(summary.totalValue) : '₦0'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">Discontinued</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-300">{summary?.discontinued || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
