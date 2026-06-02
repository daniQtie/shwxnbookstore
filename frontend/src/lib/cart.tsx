'use client';
import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react';
import type { CartItem, Product } from './types';

type CartCtx = {
  items: CartItem[];
  itemCount: number;       // total quantity across items
  totalPrice: number;
  totalWeight: number;     // kg
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (p: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = 'shwxn_cart_v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items, hydrated]);

  const add = useCallback((p: Product, qty: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === p.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, Math.max(p.stock, existing.quantity));
        return prev.map((i) => (i.product_id === p.id ? { ...i, quantity: newQty } : i));
      }
      return [
        ...prev,
        {
          product_id: p.id,
          slug: p.slug,
          name: p.name,
          price: Number(p.price),
          weight_kg: Number(p.weight_kg || 0),
          image_url: p.image_url,
          stock: Number(p.stock),
          quantity: Math.min(qty, Math.max(p.stock, 1)),
        },
      ];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.product_id === productId ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock || 99)) } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totals = useMemo(() => {
    let price = 0, weight = 0, count = 0;
    items.forEach((i) => {
      price += i.price * i.quantity;
      weight += (i.weight_kg || 0) * i.quantity;
      count += i.quantity;
    });
    return { price, weight: Number(weight.toFixed(3)), count };
  }, [items]);

  const value: CartCtx = {
    items,
    itemCount: totals.count,
    totalPrice: totals.price,
    totalWeight: totals.weight,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    add,
    setQty,
    remove,
    clear,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCart must be used inside <CartProvider>');
  return v;
}
