'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRealtime } from '@/lib/useRealtime';
import { Package, Users, DollarSign, Clock, AlertTriangle } from 'lucide-react';

type Summary = {
  totals: { products: number; customers: number; revenue: number; pending_orders: number; completed_orders: number };
  low_stock: { id: string; name: string; stock: number }[];
  recent_orders: { id: string; customer_name: string; total: number; status: string; created_at: string }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<Summary | null>(null);
  const load = () => api<Summary>('/reports/summary').then(setData).catch(() => {});

  useEffect(() => { load(); }, []);

  // Refetch summary whenever orders/products change (realtime via hook)
  useRealtime({
    collectionName: 'orders',
    fallbackPath: '/orders',
    pollIntervalMs: 5000,
    onData: () => load(),
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-900">Dashboard</h1>
        <p className="text-sm text-ink-50 mt-1 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Live overview — auto-refreshing
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Products" value={data?.totals.products ?? '—'} />
        <StatCard icon={Users} label="Total Customers" value={data?.totals.customers ?? '—'} />
        <StatCard icon={DollarSign} label="Total Revenue" value={data ? `₱${data.totals.revenue.toLocaleString()}` : '—'} />
        <StatCard icon={Clock} label="Pending Orders" value={data?.totals.pending_orders ?? '—'} />
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-cream-300 p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-ember-500" />
            <h2 className="font-serif font-semibold text-ink-900">Low stock (≤ 5)</h2>
          </div>
          {data && data.low_stock.length > 0 ? (
            <ul className="divide-y divide-cream-200">
              {data.low_stock.map((p) => (
                <li key={p.id} className="py-2 flex justify-between text-sm">
                  <span className="text-ink-500">{p.name}</span>
                  <span className="text-ember-600 font-medium">{p.stock} left</span>
                </li>
              ))}
            </ul>
          ) : <div className="text-sm text-ink-50">No low-stock items.</div>}
        </div>

        <div className="rounded-2xl bg-white border border-cream-300 p-6 shadow-soft overflow-x-auto">
          <h2 className="font-serif font-semibold mb-4 text-ink-900">Recent orders</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-ink-50 text-xs uppercase tracking-wider">
              <tr><th className="py-2">Customer</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {data?.recent_orders.map((o) => (
                <tr key={o.id}>
                  <td className="py-2.5 text-ink-900">{o.customer_name}</td>
                  <td className="font-medium">₱{Number(o.total).toLocaleString()}</td>
                  <td><span className="px-2 py-0.5 rounded-full bg-cream-200 text-xs capitalize">{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-2xl bg-white border border-cream-300 p-5 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-50 uppercase tracking-wider">{label}</span>
        <Icon className="w-4 h-4 text-ember-500" />
      </div>
      <div className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-ink-900">{value}</div>
    </div>
  );
}
