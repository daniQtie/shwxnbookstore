import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink-900 text-cream-200 relative overflow-hidden isolate">
      {/* Decorative serif watermark — desktop only */}
      <div aria-hidden className="hidden md:block absolute -bottom-16 -right-8 font-serif text-[10rem] lg:text-[14rem] leading-none text-cream-200/[0.04] select-none pointer-events-none -z-10">
        shwxn.
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid gap-10 md:grid-cols-3 relative">
        <div>
          <div className="flex items-center gap-2 text-cream-100 font-serif text-xl font-semibold">
            <BookOpen className="w-5 h-5 text-ember-400" /> shwxn<span className="text-ember-400">.</span>bookstore
          </div>
          <p className="mt-4 text-sm text-cream-200/70 leading-relaxed max-w-xs">
            A curated catalog of books — pre-order online, delivered with care across the Philippines.
          </p>
        </div>
        <div>
          <h4 className="text-cream-100 font-medium mb-4 text-sm uppercase tracking-wider">Browse</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/products" className="hover:text-ember-400 transition">Books</Link></li>
            <li><Link href="/gallery" className="hover:text-ember-400 transition">Gallery</Link></li>
            <li><Link href="/reviews" className="hover:text-ember-400 transition">Reviews</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-cream-100 font-medium mb-4 text-sm uppercase tracking-wider">Help</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/contact" className="hover:text-ember-400 transition">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream-200/10 py-6 text-center text-xs text-cream-200/50 relative">
        © {new Date().getFullYear()} shwxnbookstore. Crafted for readers.
      </div>
    </footer>
  );
}
