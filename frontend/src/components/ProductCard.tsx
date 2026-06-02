'use client';
import Link from 'next/link';
import { ShoppingBag, Weight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCart } from '@/lib/cart';
import toast from 'react-hot-toast';

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (p.stock <= 0) return;
    add(p, 1);
    toast.success(`Added ${p.name}`);
  };

  return (
    <Link
      href={`/products/${p.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white border border-cream-300/70 shadow-soft hover:shadow-card hover:-translate-y-1.5 transition-all duration-500"
    >
      <div className="aspect-[3/4] bg-cream-200 overflow-hidden relative">
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image_url}
            alt={p.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-ink-50">No image</div>
        )}
        {p.is_featured && (
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider bg-ink-900/90 text-cream-100 px-2 py-1 rounded-full backdrop-blur">
            Featured
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
        {p.stock > 0 && (
          <button
            onClick={quickAdd}
            aria-label="Add to cart"
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-ember-500 hover:bg-ember-400 text-cream-50 grid place-items-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-ember-500/40"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-serif text-[17px] font-medium text-ink-900 line-clamp-1 leading-tight">
          {p.name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-ember-500 font-semibold">
            ₱{Number(p.price).toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            {p.weight_kg > 0 && (
              <span className="text-[11px] text-ink-50 inline-flex items-center gap-0.5">
                <Weight className="w-3 h-3" />
                {p.weight_kg.toFixed(2)}kg
              </span>
            )}
            {p.stock <= 5 && p.stock > 0 && (
              <span className="text-xs text-ember-600 font-medium">Only {p.stock}</span>
            )}
            {p.stock === 0 && <span className="text-xs text-ink-50">Sold out</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
