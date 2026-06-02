'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Category, Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { ProductSkeleton } from '@/components/Skeleton';
import Reveal from '@/components/Reveal';
import { Search } from 'lucide-react';

// Next.js 14 requires useSearchParams() to be wrapped in <Suspense> for prerendering
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsView />
    </Suspense>
  );
}

function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-2xl">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-12 w-64 mt-3" />
      </div>
      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
      </div>
    </div>
  );
}

function ProductsView() {
  const params = useSearchParams();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [q, setQ] = useState('');
  const [catSlug, setCatSlug] = useState(params?.get('cat') || '');

  useEffect(() => {
    api<Product[]>('/products').then(setProducts).catch(() => setProducts([]));
    api<Category[]>('/categories').then(setCats).catch(() => {});
  }, []);

  const catIdBySlug = useMemo(() => {
    const m = new Map<string, string>();
    cats.forEach((c) => m.set(c.slug, c.id));
    return m;
  }, [cats]);

  const filtered = useMemo(() => {
    if (!products) return null;
    let list = products.filter((p) => p.is_active);
    if (catSlug && catIdBySlug.get(catSlug)) {
      list = list.filter((p) => p.category_id === catIdBySlug.get(catSlug));
    }
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle)
      );
    }
    return list;
  }, [products, catSlug, q, catIdBySlug]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Reveal>
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.2em] text-ember-500 font-medium">— The catalog</span>
          <h1 className="mt-2 font-serif text-4xl md:text-6xl font-semibold tracking-tight text-ink-900">
            All books.
          </h1>
          <p className="text-ink-50 mt-3 text-lg">Browse our complete collection.</p>
        </div>
      </Reveal>

      <Reveal delay={1}>
        <div className="mt-10 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink-50" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title or description..."
              className="w-full rounded-xl bg-cream-50 border border-cream-300 pl-11 pr-4 py-3 text-ink-900 placeholder:text-ink-50 focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500 transition"
            />
          </div>
          <select
            value={catSlug}
            onChange={(e) => setCatSlug(e.target.value)}
            className="rounded-xl bg-cream-50 border border-cream-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500 transition"
          >
            <option value="">All categories</option>
            {cats.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {!filtered ? (
          Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-20 text-ink-50 font-serif text-xl italic">
            No books found.
          </div>
        ) : (
          filtered.map((p, i) => (
            <Reveal key={p.id} delay={(Math.min(i % 5, 4)) as 0 | 1 | 2 | 3 | 4}>
              <ProductCard p={p} />
            </Reveal>
          ))
        )}
      </div>
    </div>
  );
}
