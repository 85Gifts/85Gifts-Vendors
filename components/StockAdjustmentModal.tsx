'use client';

import { useMemo, useState } from 'react';
import { Package, Plus, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface StockAdjustmentProduct {
  _id: string;
  name: string;
  inventory?: {
    totalQuantity?: number;
    availableQuantity?: number;
  };
}

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: StockAdjustmentProduct | null;
  onAdjustmentComplete: () => void;
}

function currentStock(item: StockAdjustmentProduct): number {
  const value =
    item.inventory?.availableQuantity ??
    item.inventory?.totalQuantity;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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
  const [error, setError] = useState('');

  const stock = useMemo(() => (item ? currentStock(item) : 0), [item]);

  if (!isOpen || !item) return null;

  const getNewStock = () => {
    if (operation === 'add') return stock + quantity;
    if (operation === 'subtract') return Math.max(0, stock - quantity);
    return quantity;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const nextStock = getNewStock();

    try {
      // Product update syncs the matching inventory row (variantIndex: -1).
      const response = await fetch('/api/productId', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: item._id,
          stock: nextStock,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to adjust stock');
      }

      onAdjustmentComplete();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuantity(0);
    setOperation('add');
    setError('');
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-foreground">Adjust Stock</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Product</p>
            <p className="font-semibold text-foreground">{item.name}</p>
            <p className="text-sm text-muted-foreground">Current Stock: {stock}</p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Operation
            </label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value as 'add' | 'subtract' | 'set')}
              className="w-full px-4 py-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="add">Add Stock (Add to existing)</option>
              <option value="subtract">Remove Stock (Remove from stock)</option>
              <option value="set">Set Stock (Set new value)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(0, quantity - 1))}
                className="p-2 border border-border bg-card text-foreground rounded-lg hover:bg-muted"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                className="flex-1 px-4 py-2 border border-border bg-background text-foreground rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 border border-border bg-card text-foreground rounded-lg hover:bg-muted"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
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
