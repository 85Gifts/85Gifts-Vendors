'use client';

import { useState } from 'react';
import { X, Plus, Minus, Trash2, FileText, Receipt, Link as LinkIcon, Sparkles, Loader2 } from 'lucide-react';
import { useCheckout, CheckoutItem } from '@/contexts/CheckoutContext';
import GenerateLinkModal from '@/components/inventory/GenerateLinkModal';
import { useToast } from '@/components/ui/use-toast';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, updateQuantity, removeFromCheckout } = useCheckout();
  const { toast } = useToast();
  const [showGenerateLinkModal, setShowGenerateLinkModal] = useState(false);
  const [showCustomerInfoModal, setShowCustomerInfoModal] = useState(false);
  const [showReceiptCustomerInfoModal, setShowReceiptCustomerInfoModal] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [receiptCustomerInfo, setReceiptCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  if (!isOpen) return null;

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleGenerateInvoice = () => {
    if (items.length === 0) {
      toast({
        title: 'No items',
        description: 'Please add items to checkout before generating an invoice',
        variant: 'destructive',
      });
      return;
    }
    setShowCustomerInfoModal(true);
  };

  const handleCustomerInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingInvoice(true);
    setShowCustomerInfoModal(false);

    try {
      // Transform checkout items to invoice format
      const invoiceItems = items.map((item) => ({
        name: item.name,
        description: item.description || undefined, // Optional field
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
      }));

      const response = await fetch('/api/invoices/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: invoiceItems,
          customerInfo: {
            companyName: '', // Empty string as backend requires this field
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: customerInfo.address,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = 
          (typeof errorData.error === 'object' && errorData.error?.message) 
          || errorData.error 
          || errorData.message 
          || 'Failed to generate invoice';
        
        throw new Error(errorMessage);
      }

      // Check if response is a PDF blob
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/pdf')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Invoice generated',
          description: 'Your invoice PDF has been downloaded',
        });
        
        // Reset customer info
        setCustomerInfo({
          name: '',
          email: '',
          phone: '',
          address: '',
        });
      } else {
        // Handle JSON response if backend returns something else
        const data = await response.json();
        toast({
          title: 'Invoice generated',
          description: data.message || 'Invoice generated successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Failed to generate invoice',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleGenerateReceipt = () => {
    if (items.length === 0) {
      toast({
        title: 'No items',
        description: 'Please add items to checkout before generating a receipt',
        variant: 'destructive',
      });
      return;
    }
    setShowReceiptCustomerInfoModal(true);
  };

  const handleReceiptCustomerInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (!receiptCustomerInfo.name || !receiptCustomerInfo.email || !receiptCustomerInfo.phone || !receiptCustomerInfo.address) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(receiptCustomerInfo.email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingReceipt(true);
    setShowReceiptCustomerInfoModal(false);

    try {
      // Transform checkout items to receipt format
      const receiptItems = items.map((item) => ({
        name: item.name,
        description: item.description || undefined, // Optional field
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
      }));

      const response = await fetch('/api/receipts/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: receiptItems,
          customerInfo: {
            companyName: '', // Empty string as backend requires this field
            name: receiptCustomerInfo.name,
            email: receiptCustomerInfo.email,
            phone: receiptCustomerInfo.phone,
            address: receiptCustomerInfo.address,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = 
          (typeof errorData.error === 'object' && errorData.error?.message) 
          || errorData.error 
          || errorData.message 
          || 'Failed to generate receipt';
        
        throw new Error(errorMessage);
      }

      // Check if response is a PDF blob
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/pdf')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Receipt generated',
          description: 'Your receipt PDF has been downloaded',
        });
        
        // Reset receipt customer info
        setReceiptCustomerInfo({
          name: '',
          email: '',
          phone: '',
          address: '',
        });
      } else {
        // Handle JSON response if backend returns something else
        const data = await response.json();
        toast({
          title: 'Receipt generated',
          description: data.message || 'Receipt generated successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Failed to generate receipt',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  const handleGeneratePaymentLink = () => {
    if (items.length > 1) {
      toast({
        title: 'Multiple items in checkout',
        description: 'You can only generate payment link for one item at a time',
        variant: 'destructive',
      });
      return;
    }
    setShowGenerateLinkModal(true);
  };

  const handleAIFeature = () => {
    console.log('Try AI Feature for items:', items);
    // TODO: Implement AI feature
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div>
            <h3 className="text-xl font-semibold dark:text-white">Checkout</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table */}
        <div className="p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Your checkout is empty</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Available Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {item.description}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {item.category}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium dark:text-white">
                        ₦{item.price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium dark:text-white">
                        {item.inventory.availableQuantity}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="p-1 rounded-md border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-medium dark:text-white min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="p-1 rounded-md border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            disabled={item.quantity >= item.inventory.availableQuantity}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold dark:text-white">
                          ₦{(item.price * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => removeFromCheckout(item._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                          title="Remove from checkout"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Subtotal */}
        {items.length > 0 && (
          <div className="px-6 pb-6 border-b dark:border-gray-800">
            <div className="flex justify-end">
              <div className="w-full max-w-md">
                <div className="flex justify-between items-center py-3">
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Subtotal:</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₦{subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {items.length > 0 && (
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
            <div className="grid grid-cols-2 gap-4">
              {/* Generate Invoice */}
              <button
                onClick={handleGenerateInvoice}
                disabled={isGeneratingInvoice}
                className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-3"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isGeneratingInvoice ? (
                  <Loader2 className="w-5 h-5 relative z-10 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5 relative z-10" />
                )}
                <span className="font-semibold relative z-10">
                  {isGeneratingInvoice ? 'Generating...' : 'Generate Invoice'}
                </span>
              </button>

              {/* Generate Receipt */}
              <button
                onClick={handleGenerateReceipt}
                disabled={isGeneratingReceipt}
                className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-3"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isGeneratingReceipt ? (
                  <Loader2 className="w-5 h-5 relative z-10 animate-spin" />
                ) : (
                  <Receipt className="w-5 h-5 relative z-10" />
                )}
                <span className="font-semibold relative z-10">
                  {isGeneratingReceipt ? 'Generating...' : 'Generate Receipt'}
                </span>
              </button>

              {/* Generate Payment Link */}
              <button
                onClick={handleGeneratePaymentLink}
                className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <LinkIcon className="w-5 h-5 relative z-10" />
                <span className="font-semibold relative z-10">Generate Payment Link</span>
              </button>

              {/* Try Our AI Feature */}
              <button
                onClick={handleAIFeature}
                className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Sparkles className="w-5 h-5 relative z-10" />
                <span className="font-semibold relative z-10">Try Our AI Feature</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Generate Link Modal */}
      <GenerateLinkModal
        isOpen={showGenerateLinkModal}
        onClose={() => setShowGenerateLinkModal(false)}
      />

      {/* Customer Information Modal */}
      {showCustomerInfoModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          onClick={() => !isGeneratingInvoice && setShowCustomerInfoModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Provide customer details
                </p>
              </div>
              <button
                onClick={() => setShowCustomerInfoModal(false)}
                disabled={isGeneratingInvoice}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCustomerInfoSubmit} className="p-4 space-y-3">
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, name: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="John Doe"
                  disabled={isGeneratingInvoice}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={customerInfo.email}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, email: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="customer@example.com"
                  disabled={isGeneratingInvoice}
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={customerInfo.phone}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, phone: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="+1234567890"
                  disabled={isGeneratingInvoice}
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Address *
                </label>
                <textarea
                  id="address"
                  required
                  value={customerInfo.address}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, address: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="123 Main St, City, State"
                  rows={2}
                  disabled={isGeneratingInvoice}
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCustomerInfoModal(false)}
                  disabled={isGeneratingInvoice}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingInvoice}
                  className="flex-1 px-3 py-1.5 text-sm bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-md shadow hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isGeneratingInvoice ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Invoice'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Customer Information Modal */}
      {showReceiptCustomerInfoModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          onClick={() => !isGeneratingReceipt && setShowReceiptCustomerInfoModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Provide customer details
                </p>
              </div>
              <button
                onClick={() => setShowReceiptCustomerInfoModal(false)}
                disabled={isGeneratingReceipt}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleReceiptCustomerInfoSubmit} className="p-4 space-y-3">
              <div>
                <label
                  htmlFor="receipt-name"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="receipt-name"
                  required
                  value={receiptCustomerInfo.name}
                  onChange={(e) =>
                    setReceiptCustomerInfo({ ...receiptCustomerInfo, name: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="John Doe"
                  disabled={isGeneratingReceipt}
                />
              </div>

              <div>
                <label
                  htmlFor="receipt-email"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="receipt-email"
                  required
                  value={receiptCustomerInfo.email}
                  onChange={(e) =>
                    setReceiptCustomerInfo({ ...receiptCustomerInfo, email: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="customer@example.com"
                  disabled={isGeneratingReceipt}
                />
              </div>

              <div>
                <label
                  htmlFor="receipt-phone"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="receipt-phone"
                  required
                  value={receiptCustomerInfo.phone}
                  onChange={(e) =>
                    setReceiptCustomerInfo({ ...receiptCustomerInfo, phone: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="+1234567890"
                  disabled={isGeneratingReceipt}
                />
              </div>

              <div>
                <label
                  htmlFor="receipt-address"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Address *
                </label>
                <textarea
                  id="receipt-address"
                  required
                  value={receiptCustomerInfo.address}
                  onChange={(e) =>
                    setReceiptCustomerInfo({ ...receiptCustomerInfo, address: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="123 Main St, City, State"
                  rows={2}
                  disabled={isGeneratingReceipt}
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReceiptCustomerInfoModal(false)}
                  disabled={isGeneratingReceipt}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingReceipt}
                  className="flex-1 px-3 py-1.5 text-sm bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-md shadow hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isGeneratingReceipt ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Receipt'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
