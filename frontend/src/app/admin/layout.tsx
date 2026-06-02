'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const isLogin = pathname === '/admin/login';
  // Receipt route renders without the admin sidebar (clean full-width page for capture/print)
  const isStandalone = !!pathname?.includes('/receipt');

  useEffect(() => {
    if (isLogin) { setChecking(false); return; }
    api('/auth/me')
      .then(() => setChecking(false))
      .catch(() => router.replace('/admin/login'));
  }, [pathname, router, isLogin]);

  if (isLogin) return <>{children}</>;
  if (checking) return <div className="p-12 text-slate-500">Checking session...</div>;
  if (isStandalone) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
