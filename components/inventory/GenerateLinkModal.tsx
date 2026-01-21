'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, Copy, Loader2 } from 'lucide-react';
import { useCheckout, CheckoutItem } from '@/contexts/CheckoutContext';
import { useToast } from '@/components/ui/use-toast';

interface GenerateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditableItem extends CheckoutItem {
  editedQuantity: number;
  editedPrice: number;
}

export default function GenerateLinkModal({ isOpen, onClose }: GenerateLinkModalProps) {
  const { items } = useCheckout();
  const { toast } = useToast();
  const [editableItems, setEditableItems] = useState<EditableItem[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Initialize editable items when modal opens
  useEffect(() => {
    if (isOpen && items.length > 0) {
      setEditableItems(
        items.map((item) => ({
          ...item,
          editedQuantity: item.quantity,
          editedPrice: item.price,
        }))
      );
      setAcceptedTerms(false);
      setGeneratedLink(null);
    }
  }, [isOpen, items]);

  if (!isOpen) return null;

  const handleQuantityChange = (itemId: string, delta: number) => {
    setEditableItems((prev) =>
      prev.map((item) => {
        if (item._id === itemId) {
          const newQuantity = Math.max(1, Math.min(item.inventory.availableQuantity, item.editedQuantity + delta));
          return { ...item, editedQuantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handlePriceChange = (itemId: string, newPrice: number) => {
    if (newPrice < 0) return;
    setEditableItems((prev) =>
      prev.map((item) => {
        if (item._id === itemId) {
          return { ...item, editedPrice: newPrice };
        }
        return item;
      })
    );
  };

  const handleGenerateLink = async () => {
    if (!acceptedTerms) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/inventory/generate-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: editableItems.map((item) => ({
            productId: item._id,
            quantity: item.editedQuantity,
            price: item.editedPrice,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error object structure: data.error.message or data.error or data.message
        const errorMessage = 
          (typeof data.error === 'object' && data.error?.message) 
          || data.error 
          || data.message 
          || 'Failed to generate link';
        throw new Error(errorMessage);
      }

      // Extract link from nested response structure: data.data.data.link
      const linkData = data?.data?.data || data?.data;
      const link = linkData?.link || `${window.location.origin}/inventory/${linkData?.slug}`;
      
      if (!link || link.includes('undefined')) {
        throw new Error('Invalid link received from server');
      }
      
      setGeneratedLink(link);

      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(link);
        toast({
          title: 'Link generated and copied!',
          description: link,
        });
      } catch (error) {
        toast({
          title: 'Link generated',
          description: link,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Failed to generate link',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast({
        title: 'Link copied!',
        description: generatedLink,
      });
    } catch (error) {
      toast({
        title: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  const totalAmount = editableItems.reduce((sum, item) => sum + (item.editedPrice * item.editedQuantity), 0);

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div>
            <h3 className="text-xl font-semibold dark:text-white">Generate Payment Link</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Adjust quantities and prices, then generate a shareable link
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Items List */}
          <div className="space-y-4">
            {editableItems.map((item) => (
              <div
                key={item._id}
                className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Available: {item.inventory.availableQuantity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item._id, -1)}
                        disabled={item.editedQuantity <= 1}
                        className="p-1 rounded-md border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium dark:text-white min-w-[3rem] text-center">
                        {item.editedQuantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item._id, 1)}
                        disabled={item.editedQuantity >= item.inventory.availableQuantity}
                        className="p-1 rounded-md border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price (₦)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.editedPrice}
                      onChange={(e) => handlePriceChange(item._id, parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Subtotal: <span className="font-semibold dark:text-white">₦{(item.editedPrice * item.editedQuantity).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Amount:</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ₦{totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Generated Link Display */}
          {generatedLink && (
            <div className="border dark:border-gray-700 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Link Generated!</p>
                  <p className="text-sm text-green-700 dark:text-green-400 truncate">{generatedLink}</p>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="ml-4 p-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors"
                  title="Copy link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="flex items-start gap-3">
            <button
              onClick={() => setAcceptedTerms(!acceptedTerms)}
              className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                acceptedTerms
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
              }`}
            >
              {acceptedTerms && <Check className="w-3 h-3" />}
            </button>
            <label
              onClick={() => setAcceptedTerms(!acceptedTerms)}
              className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              I accept the terms and conditions for generating payment links
            </label>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateLink}
            disabled={!acceptedTerms || isGenerating || editableItems.length === 0}
            className="w-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Link...
              </>
            ) : (
              'Generate Payment Link'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
