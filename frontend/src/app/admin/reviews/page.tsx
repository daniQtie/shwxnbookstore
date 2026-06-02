'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useRealtime } from '@/lib/useRealtime';
import type { Review } from '@/lib/types';
import toast from 'react-hot-toast';
import { Check, X, Trash2, Star } from 'lucide-react';

export default function AdminReviewsPage() {
  const [items, setItems] = useState<Review[]>([]);

  useRealtime({
    collectionName: 'reviews',
    fallbackPath: '/reviews/admin/all',
    pollIntervalMs: 5000,
    onData: (list: Review[]) => setItems(list),
  });

  const setStatus = async (id: string, status: 'approved' | 'disapproved') => {
    try { await api(`/reviews/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); toast.success('Updated'); }
    catch (e: any) { toast.error(e.message); }
  };
  const remove = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try { await api(`/reviews/${id}`, { method: 'DELETE' }); toast.success('Deleted'); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-900">Reviews</h1>
        <p className="text-sm text-ink-50 mt-1 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Live — updates automatically
        </p>
      </div>
      <div className="mt-6 space-y-3">
        {items.map((r) => (
          <div key={r.id} className="rounded-2xl bg-white border border-cream-300 p-5 shadow-soft hover:shadow-card transition">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-ink-900">{r.customer_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    r.status === 'pending' ? 'bg-ember-500/10 text-ember-600' : 'bg-cream-200 text-ink-50'
                  }`}>{r.status}</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-ember-500">
                  {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="mt-2 text-ink-500 font-serif italic">&ldquo;{r.comment}&rdquo;</p>
                <div className="text-xs text-ink-50 mt-2">{r.created_at && new Date(r.created_at).toLocaleString()}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setStatus(r.id, 'approved')} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition" title="Approve"><Check className="w-4 h-4" /></button>
                <button onClick={() => setStatus(r.id, 'disapproved')} className="p-2 rounded-lg hover:bg-cream-200 transition" title="Disapprove"><X className="w-4 h-4" /></button>
                <button onClick={() => remove(r.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-ink-50 font-serif italic">No reviews yet.</div>}
      </div>
    </div>
  );
}
