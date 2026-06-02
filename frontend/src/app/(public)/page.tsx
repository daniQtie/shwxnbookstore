'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Category, Product, Review } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { ProductSkeleton } from '@/components/Skeleton';
import Reveal from '@/components/Reveal';
import { ArrowRight, Star, BookOpen, Sparkles, Quote } from 'lucide-react';

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[] | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    api<Product[]>('/products').then((d) => setFeatured(d.filter((p) => p.is_featured && p.is_active).slice(0, 8))).catch(() => setFeatured([]));
    api<Category[]>('/categories').then(setCats).catch(() => {});
    api<Review[]>('/reviews').then((d) => setReviews(d.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <>
      {/* Hero — deep espresso with warm overlays */}
      <section className="relative bg-ink-900 text-cream-100 overflow-hidden isolate">
        {/* Glow blobs */}
        <div aria-hidden className="absolute -top-32 -left-32 w-[320px] md:w-[480px] h-[320px] md:h-[480px] rounded-full bg-ember-500/20 blur-3xl -z-10" />
        <div aria-hidden className="absolute -bottom-40 right-0 w-[360px] md:w-[520px] h-[360px] md:h-[520px] rounded-full bg-moss-500/15 blur-3xl -z-10" />
        {/* Decorative serif watermark — hidden on mobile, contained on desktop */}
        <div
          aria-hidden
          className="hidden lg:block absolute top-1/2 -translate-y-1/2 -right-8 font-serif text-[16rem] xl:text-[22rem] leading-none text-cream-100/[0.04] select-none pointer-events-none -z-10"
        >
          read.
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
          <div className="max-w-3xl">
            <Reveal>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-100/10 border border-cream-100/15 text-cream-100/80 text-xs font-medium backdrop-blur">
                <Sparkles className="w-3.5 h-3.5 text-ember-400" />
                <span className="hidden sm:inline">Curated for readers in the Philippines</span>
                <span className="sm:hidden">Curated for readers</span>
              </span>
            </Reveal>
            <Reveal delay={1}>
              <h1 className="mt-6 font-serif text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-semibold tracking-tight leading-[1.05]">
                Stories worth your
                <span className="block italic text-ember-400">shelf space.</span>
              </h1>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-6 text-cream-200/80 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed">
                A small, careful catalog, contemporary fiction, and timeless titles. Pre-order online; we&apos;ll bring them to your door.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div className="mt-8 md:mt-10 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-2 bg-ember-500 hover:bg-ember-400 text-cream-50 font-medium px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl transition-all shadow-lg shadow-ember-500/30 hover:shadow-ember-500/50 hover:-translate-y-0.5"
                >
                  Browse books
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/reviews"
                  className="inline-flex items-center gap-2 border border-cream-100/20 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl hover:bg-cream-100/5 transition"
                >
                  Read reviews
                </Link>
              </div>
            </Reveal>

            {/* Stat strip */}
            <Reveal delay={4}>
              <div className="mt-12 md:mt-16 grid grid-cols-3 gap-4 sm:gap-6 max-w-md border-t border-cream-100/10 pt-6 md:pt-8">
                <Stat label="Curated titles" value="200+" />
                <Stat label="Avg. rating" value="4.9★" />
                <Stat label="Readers served" value="1.2k" />
              </div>
            </Reveal>
          </div>
        </div>

        {/* Decorative bottom edge — cream wave */}
        <div aria-hidden className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-cream-100 -z-10" />
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <Reveal>
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-ember-500 font-medium">— On the shelf</span>
              <h2 className="mt-2 font-serif text-3xl md:text-5xl font-semibold text-ink-900 tracking-tight">
                Featured this month
              </h2>
            </div>
            <Link href="/products" className="text-ink-500 hover:text-ember-500 text-sm inline-flex items-center gap-1 group transition">
              View all
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {!featured
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : featured.map((p, i) => (
                <Reveal key={p.id} delay={(Math.min(i, 4)) as 0 | 1 | 2 | 3 | 4}>
                  <ProductCard p={p} />
                </Reveal>
              ))}
        </div>
      </section>

      {/* Categories — editorial bento */}
      <section className="bg-cream-200/60 border-y border-cream-300/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <Reveal>
            <div className="max-w-2xl mb-12">
              <span className="text-xs uppercase tracking-[0.2em] text-ember-500 font-medium">— Browse</span>
              <h2 className="mt-2 font-serif text-3xl md:text-5xl font-semibold tracking-tight">
                Find your next read by genre.
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cats.map((c, i) => (
              <Reveal key={c.id} delay={(Math.min(i, 4)) as 0 | 1 | 2 | 3 | 4}>
                <Link
                  href={`/products?cat=${c.slug}`}
                  className="block h-full rounded-2xl bg-cream-50 border border-cream-300 p-5 shadow-soft hover:shadow-card hover:-translate-y-1 hover:border-ember-500/40 transition-all duration-300 group relative overflow-hidden"
                >
                  <BookOpen className="w-5 h-5 text-ember-500/70 mb-3 transition-transform group-hover:scale-110 group-hover:rotate-[-4deg]" />
                  <div className="font-serif text-lg font-semibold text-ink-900">{c.name}</div>
                  {c.description && (
                    <div className="text-sm text-ink-50 mt-1 line-clamp-2">{c.description}</div>
                  )}
                  <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-ember-500 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews — magazine quotes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.2em] text-ember-500 font-medium">— Praise</span>
            <h2 className="mt-2 font-serif text-3xl md:text-5xl font-semibold tracking-tight">
              What readers are saying.
            </h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <Reveal key={r.id} delay={(i as 0 | 1 | 2)}>
              <div className="relative h-full rounded-2xl bg-cream-50 border border-cream-300 p-7 shadow-soft hover:shadow-card transition group">
                <Quote className="absolute -top-3 left-6 w-7 h-7 text-ember-500 fill-ember-500/10" />
                <div className="flex items-center gap-1 text-ember-500 mt-2">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-ink-500 font-serif text-lg leading-relaxed italic">
                  &ldquo;{r.comment}&rdquo;
                </p>
                <div className="mt-6 pt-4 border-t border-cream-300 text-sm text-ink-50">
                  — {r.customer_name}
                </div>
              </div>
            </Reveal>
          ))}
          {reviews.length === 0 && <div className="text-ink-50 col-span-full text-center">No reviews yet.</div>}
        </div>
      </section>

      {/* CTA strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <Reveal>
          <div className="rounded-3xl bg-ink-900 text-cream-100 p-8 sm:p-10 md:p-14 relative overflow-hidden isolate">
            <div aria-hidden className="absolute -top-20 -right-20 w-72 md:w-80 h-72 md:h-80 rounded-full bg-ember-500/20 blur-3xl -z-10" />
            <div className="relative max-w-2xl">
              <h3 className="font-serif text-3xl md:text-4xl font-semibold">
                Ready to start your next chapter?
              </h3>
              <p className="mt-4 text-cream-200/70">
                Pre-orders open daily. New titles drop every Friday.
              </p>
              <Link
                href="/products"
                className="mt-8 inline-flex items-center gap-2 bg-ember-500 hover:bg-ember-400 text-cream-50 font-medium px-6 py-3.5 rounded-xl transition shadow-lg shadow-ember-500/30"
              >
                Browse the catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-serif text-2xl md:text-3xl font-semibold text-cream-100">{value}</div>
      <div className="mt-1 text-xs text-cream-200/60 uppercase tracking-wider">{label}</div>
    </div>
  );
}
