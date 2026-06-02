'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Product } from '@/lib/types';
import toast from 'react-hot-toast';
import { ShoppingBag, ArrowLeft, Plus, Minus, Weight, Check } from 'lucide-react';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { useCart } from '@/lib/cart';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [p, setP] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const { add, openCart, items } = useCart();

  useEffect(() => {
    api<Product>(`/products/slug/${slug}`)
      .then(setP)
      .catch(() => setP(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="max-w-7xl mx-auto p-12 text-ink-50">Loading...</div>;
  if (!p) return <div className="max-w-7xl mx-auto p-12 font-serif text-2xl italic">Book not found.</div>;

  const alreadyInCart = items.find((i) => i.product_id === p.id);
  const lineSubtotal = Number(p.price) * qty;
  const lineWeight = Number(p.weight_kg || 0) * qty;

  const onAdd = () => {
    add(p, qty);
    setJustAdded(true);
    toast.success(`Added ${qty} × ${p.name} to cart`);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const onBuyNow = () => {
    add(p, qty);
    openCart();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-ink-50 hover:text-ember-500 transition mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to catalog
      </Link>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        <Reveal>
          <div className="rounded-2xl overflow-hidden bg-cream-200 shadow-card relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 ring-1 ring-inset ring-ink-900/10 rounded-2xl pointer-events-none" />
          </div>
        </Reveal>
        <Reveal delay={1}>
          <div className="md:py-4">
            {p.is_featured && (
              <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-ember-500 font-medium mb-3">
                — Featured
              </span>
            )}
            <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight text-ink-900 leading-tight">
              {p.name}
            </h1>
            <div className="mt-5 flex items-baseline gap-4 flex-wrap">
              <div className="text-3xl text-ember-500 font-serif font-semibold">
                ₱{Number(p.price).toLocaleString()}
              </div>
              {p.weight_kg > 0 && (
                <div className="text-sm text-ink-50 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream-200">
                  <Weight className="w-3.5 h-3.5" />
                  {p.weight_kg.toFixed(2)} kg
                </div>
              )}
            </div>
            <div className="mt-3 text-sm text-ink-50">
              {p.stock > 0 ? `${p.stock} copies in stock` : 'Currently out of stock'}
            </div>
            <div className="mt-8 h-px bg-cream-300" />
            <p className="mt-8 text-ink-500 leading-relaxed whitespace-pre-line">{p.description}</p>

            {/* Quantity + add to cart */}
            {p.stock > 0 && (
              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm text-ink-500 font-medium">Quantity</span>
                  <div className="inline-flex items-center border border-cream-300 bg-white rounded-xl">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="p-2.5 hover:bg-cream-100 transition rounded-l-xl"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-base font-medium min-w-[3ch] text-center">{qty}</span>
                    <button
                      onClick={() => setQty(Math.min(p.stock, qty + 1))}
                      disabled={qty >= p.stock}
                      className="p-2.5 hover:bg-cream-100 transition rounded-r-xl disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {qty > 1 && (
                  <div className="text-sm text-ink-50 flex gap-4 flex-wrap">
                    <span>Subtotal: <strong className="text-ember-500">₱{lineSubtotal.toLocaleString()}</strong></span>
                    {p.weight_kg > 0 && (
                      <span>Weight: <strong className="text-ink-900">{lineWeight.toFixed(2)} kg</strong></span>
                    )}
                  </div>
                )}

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={onAdd}
                    className="inline-flex items-center gap-2 border-2 border-ember-500 text-ember-500 hover:bg-ember-500 hover:text-cream-50 font-medium px-6 py-3 rounded-xl transition-all"
                  >
                    {justAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                    {justAdded ? 'Added!' : alreadyInCart ? 'Add more' : 'Add to cart'}
                  </button>
                  <button
                    onClick={onBuyNow}
                    className="inline-flex items-center gap-2 bg-ember-500 hover:bg-ember-400 text-cream-50 font-medium px-6 py-3 rounded-xl transition-all shadow-lg shadow-ember-500/30 hover:shadow-ember-500/50 hover:-translate-y-0.5"
                  >
                    Buy now →
                  </button>
                </div>

                {alreadyInCart && (
                  <button
                    onClick={openCart}
                    className="text-sm text-ember-500 hover:text-ember-600 transition inline-flex items-center gap-1"
                  >
                    {alreadyInCart.quantity} already in your cart — view cart →
                  </button>
                )}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
