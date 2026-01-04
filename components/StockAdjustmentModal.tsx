'use client';

import { useState } from 'react';
import { Package, Plus, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
}

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onAdjustmentComplete: () => void;
}

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  item,
  onAdjustmentComplete,
}: StockAdjustmentModalProps) {
  const [quantity, setQuantity] = useState(0);
  const [operation, setOperation] = useState<'add' | 'subtract' | 'set'>('add');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/inventory/${item.id}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: Math.abs(quantity),
          operation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to adjust stock');
      }

      onAdjustmentComplete();
      handleClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuantity(0);
    setOperation('add');
    onClose();
  };

  const getButtonLabel = () => {
    switch (operation) {
      case 'add': return 'Add Stock';
      case 'subtract': return 'Remove Stock';
      case 'set': return 'Set Stock';
      default: return 'Adjust';
    }
  };

  const getNewStock = () => {
    const current = item.quantity;
    if (operation === 'add') return current + quantity;
    if (operation === 'subtract') return Math.max(0, current - quantity);
    return quantity;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Adjust Stock</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Product ID</p>
            <p className="font-semibold">{item.productId}</p>
            <p className="text-sm text-gray-500">Current Stock: {item.quantity}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operation
            </label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value as any)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="add">Add Stock (Add to existing)</option>
              <option value="subtract">Remove Stock (Remove from stock)</option>
              <option value="set">Set Stock (Set new value)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(0, quantity - 1))}
                className="p-2 border rounded-lg hover:bg-gray-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="flex-1 px-4 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 border rounded-lg hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>New Stock:</strong> {getNewStock()}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Processing...' : getButtonLabel()}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
