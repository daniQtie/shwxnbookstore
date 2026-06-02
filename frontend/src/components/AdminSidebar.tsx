'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Tags, Package, ShoppingCart, Users, Star, BarChart3, LogOut, BookOpen, Settings,
} from 'lucide-react';
import { useState } from 'react';
import { useRealtime } from '@/lib/useRealtime';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const items = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, badgeKey: 'orders' as const },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/reviews', label: 'Reviews', icon: Star, badgeKey: 'reviews' as const },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/account', label: 'Account', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [badges, setBadges] = useState<{ orders: number; reviews: number }>({ orders: 0, reviews: 0 });

  // Realtime badge counts — Firestore onSnapshot first, polling fallback
  useRealtime({
    collectionName: 'orders',
    fallbackPath: '/orders',
    pollIntervalMs: 5000,
    onData: (rows: any[]) => {
      const count = rows.filter((o) => o.status === 'pending').length;
      setBadges((b) => ({ ...b, orders: count }));
    },
  });
  useRealtime({
    collectionName: 'reviews',
    fallbackPath: '/reviews/admin/all',
    pollIntervalMs: 5000,
    onData: (rows: any[]) => {
      const count = rows.filter((r) => r.status === 'pending').length;
      setBadges((b) => ({ ...b, reviews: count }));
    },
  });

  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch {}
    localStorage.removeItem('token');
    toast.success('Logged out');
    router.push('/admin/login');
  };

  return (
    <aside className="w-64 shrink-0 bg-ink-900 text-cream-200 min-h-screen flex flex-col">
      <Link href="/admin/dashboard" className="px-6 h-16 flex items-center gap-2 border-b border-cream-200/10">
        <BookOpen className="w-5 h-5 text-ember-400" />
        <span className="font-serif font-semibold text-cream-100">shwxn<span className="text-ember-400">.</span>admin</span>
      </Link>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname?.startsWith(it.href);
          const badge = it.badgeKey ? badges[it.badgeKey] : 0;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition group ${
                active
                  ? 'bg-ember-500/15 text-ember-400'
                  : 'hover:bg-cream-200/5 text-cream-200/80 hover:text-cream-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-sm">{it.label}</span>
              {badge > 0 && (
                <span className="text-[10px] bg-ember-500 text-ink-900 rounded-full px-2 py-0.5 font-bold animate-reveal-up">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={logout}
        className="m-3 flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-cream-200/5 text-cream-200/70 hover:text-cream-100 transition"
      >
        <LogOut className="w-4 h-4" /> <span className="text-sm">Logout</span>
      </button>
    </aside>
  );
}
