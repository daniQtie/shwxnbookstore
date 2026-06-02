'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Product } from '@/lib/types';
import { ProductSkeleton } from '@/components/Skeleton';
import Reveal from '@/components/Reveal';
import Link from 'next/link';

export default function GalleryPage() {
  const [items, setItems] = useState<Product[] | null>(null);
  useEffect(() => {
    api<Product[]>('/products').then((d) => setItems(d.filter((p) => p.is_active && p.image_url))).catch(() => setItems([]));
  }, []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Reveal>
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.2em] text-ember-500 font-medium">— Visual</span>
          <h1 className="mt-2 font-serif text-4xl md:text-6xl font-semibold tracking-tight text-ink-900">
            Gallery.
          </h1>
          <p className="text-ink-50 mt-3 text-lg">A visual tour of titles on the shelf.</p>
        </div>
      </Reveal>
      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {!items
          ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
          : items.map((p, i) => (
              <Reveal key={p.id} delay={(Math.min(i % 5, 4)) as 0 | 1 | 2 | 3 | 4}>
                <Link
                  href={`/products/${p.slug}`}
                  className="block rounded-2xl overflow-hidden bg-cream-200 aspect-[3/4] shadow-soft hover:shadow-card hover:-translate-y-1 transition group relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-ink-900/85 to-transparent opacity-0 group-hover:opacity-100 transition">
                    <div className="font-serif text-cream-100 text-sm line-clamp-1">{p.name}</div>
                  </div>
                </Link>
              </Reveal>
            ))}
      </div>
    </div>
  );
}
