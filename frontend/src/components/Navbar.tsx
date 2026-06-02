'use client';
import Link from 'next/link';
import { BookOpen, Menu, X, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart';

const links = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Books' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled
          ? 'bg-cream-100/85 backdrop-blur-md border-b border-cream-300/60 shadow-soft'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="relative">
            <BookOpen className="w-6 h-6 text-ember-500 transition-transform group-hover:rotate-[-6deg]" />
            <span className="absolute -inset-2 rounded-full bg-ember-500/10 opacity-0 group-hover:opacity-100 transition" />
          </span>
          <span className="font-serif text-lg font-semibold text-ink-900 tracking-tight">
            shwxn<span className="text-ember-500">.</span>bookstore
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative px-3 py-2 text-sm text-ink-500 hover:text-ink-900 transition group"
            >
              <span>{l.label}</span>
              <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-ember-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <CartButton itemCount={itemCount} onClick={openCart} />
          <button
            className="md:hidden p-2 rounded-lg hover:bg-cream-200 transition ml-1"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-cream-300 bg-cream-100">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 rounded-lg text-ink-500 hover:bg-cream-200 hover:text-ink-900 transition"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function CartButton({ itemCount, onClick }: { itemCount: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={`Cart with ${itemCount} items`}
      className="relative p-2 rounded-lg hover:bg-cream-200 transition group"
    >
      <ShoppingBag className="w-5 h-5 text-ink-900 group-hover:text-ember-500 transition-colors" />
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-ember-500 text-cream-50 text-[10px] font-bold grid place-items-center animate-reveal-up">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
