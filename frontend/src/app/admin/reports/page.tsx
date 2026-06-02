'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Summary = { totals: { revenue: number; completed_orders: number } };
type Monthly = { month: string; revenue: number }[];
type Top = { product_id: string; name: string; qty: number; revenue: number }[];

export default function AdminReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [monthly, setMonthly] = useState<Monthly>([]);
  const [top, setTop] = useState<Top>([]);

  useEffect(() => {
    api<Summary>('/reports/summary').then(setSummary).catch(() => {});
    api<Monthly>('/reports/monthly-revenue').then(setMonthly).catch(() => {});
    api<Top>('/reports/top-products').then(setTop).catch(() => {});
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Reports</h1>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-soft">
          <div className="text-sm text-slate-500">Total Revenue</div>
          <div className="mt-2 text-3xl font-semibold text-emerald-600">
            ₱{(summary?.totals.revenue ?? 0).toLocaleString()}
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-soft">
          <div className="text-sm text-slate-500">Total Completed Orders</div>
          <div className="mt-2 text-3xl font-semibold">{summary?.totals.completed_orders ?? 0}</div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white border border-slate-200 p-6 shadow-soft">
        <h2 className="font-medium mb-4">Monthly revenue — last 12 months</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={monthly}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white border border-slate-200 p-6 shadow-soft">
        <h2 className="font-medium mb-4">Top 10 best-selling products</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr><th className="py-2">#</th><th>Product</th><th>Qty sold</th><th>Revenue</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {top.map((p, i) => (
              <tr key={p.product_id}>
                <td className="py-2 text-slate-500">{i + 1}</td>
                <td>{p.name}</td>
                <td>{p.qty}</td>
                <td>₱{Number(p.revenue).toLocaleString()}</td>
              </tr>
            ))}
            {top.length === 0 && <tr><td colSpan={4} className="py-3 text-slate-500">No sales data yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
