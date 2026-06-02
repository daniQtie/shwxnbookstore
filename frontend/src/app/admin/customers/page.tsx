'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Customer, Order } from '@/lib/types';
import { X } from 'lucide-react';

export default function AdminCustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<{ customer: Customer; orders: Order[] } | null>(null);

  useEffect(() => { api<Customer[]>('/customers').then(setItems).catch(() => {}); }, []);

  const openProfile = async (c: Customer) => {
    try {
      const data = await api<{ customer: Customer; orders: Order[] }>(`/customers/${c.id}`);
      setSelected(data);
    } catch {}
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Customers</h1>
      <div className="mt-6 rounded-2xl bg-white border border-slate-200 shadow-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th><th>Email</th><th>Orders</th><th>Total spent</th><th>Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openProfile(c)}>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="text-slate-500">{c.email}</td>
                <td>{c.orders_count ?? 0}</td>
                <td>₱{Number(c.total_spent ?? 0).toLocaleString()}</td>
                <td className="text-slate-500 truncate max-w-xs">{c.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-slate-900/50 grid place-items-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{selected.customer.name}</h3>
              <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-sm text-slate-600 space-y-1">
              <div>{selected.customer.email}</div>
              {selected.customer.phone && <div>{selected.customer.phone}</div>}
              <div>{selected.customer.address}</div>
            </div>
            <h4 className="font-medium mt-5 mb-2">Order history</h4>
            <ul className="divide-y divide-slate-100 text-sm">
              {selected.orders.map((o) => (
                <li key={o.id} className="py-2 flex justify-between">
                  <span>{o.created_at ? new Date(o.created_at).toLocaleDateString() : ''} · {o.status}</span>
                  <span>₱{Number(o.total).toLocaleString()}</span>
                </li>
              ))}
              {selected.orders.length === 0 && <li className="py-2 text-slate-500">No orders yet.</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
