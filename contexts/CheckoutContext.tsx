'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CheckoutItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  inventory: {
    totalQuantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    itemCount: number;
    hasVariants: boolean;
    status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  };
}

interface CheckoutContextType {
  items: CheckoutItem[];
  addToCheckout: (item: Omit<CheckoutItem, 'quantity'>) => void;
  removeFromCheckout: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCheckout: () => void;
  getTotalItems: () => number;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CheckoutItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('checkout-items');
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (error) {
        console.error('Error loading checkout items:', error);
      }
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('checkout-items', JSON.stringify(items));
  }, [items]);

  const addToCheckout = (item: Omit<CheckoutItem, 'quantity'>) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i._id === item._id);
      if (existingItem) {
        // If item already exists, increment quantity
        return prevItems.map((i) =>
          i._id === item._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        // Add new item with quantity 1
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCheckout = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item._id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCheckout(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item._id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCheckout = () => {
    setItems([]);
    localStorage.removeItem('checkout-items');
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CheckoutContext.Provider
      value={{
        items,
        addToCheckout,
        removeFromCheckout,
        updateQuantity,
        clearCheckout,
        getTotalItems,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
