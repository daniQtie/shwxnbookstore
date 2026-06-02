'use client';
import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useRealtime } from '@/lib/useRealtime';
import type { Order, OrderStatus, Courier } from '@/lib/types';
import toast from 'react-hot-toast';
import { X, Bell, Truck, ExternalLink, Copy, Receipt, MessageCircle, Mail, Send } from 'lucide-react';
import Link from 'next/link';
import { COURIER_OPTIONS, getCourierLabel, getTrackingUrl } from '@/lib/couriers';

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-ember-500/10 text-ember-600 border-ember-500/30',
  confirmed: 'bg-moss-500/10 text-moss-600 border-moss-500/30',
  processing: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  completed: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
  cancelled: 'bg-slate-300/30 text-slate-600 border-slate-300',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const seenIdsRef = useRef<Set<string> | null>(null);

  useRealtime({
    collectionName: 'orders',
    fallbackPath: '/orders',
    pollIntervalMs: 4000,
    onData: (list: Order[]) => {
      if (!seenIdsRef.current) {
        seenIdsRef.current = new Set(list.map((o) => o.id));
      } else {
        const newOnes = list.filter((o) => !seenIdsRef.current!.has(o.id));
        newOnes.forEach((o) => {
          seenIdsRef.current!.add(o.id);
          toast.success(`New order from ${o.customer_name}`, {
            icon: '📦',
            duration: 5000,
          });
          setHighlightedId(o.id);
          setTimeout(() => setHighlightedId(null), 4000);
        });
      }
      setOrders(list);
      // Keep the open modal data in sync with realtime updates
      setSelected((prev) => (prev ? list.find((o) => o.id === prev.id) || null : null));
    },
  });

  const setStatus = async (id: string, status: OrderStatus) => {
    try {
      await api(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      toast.success('Status updated');
    } catch (e: any) { toast.error(e.message); }
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-900">Orders</h1>
          <p className="text-sm text-ink-50 mt-1 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live — updates automatically
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ember-500/10 border border-ember-500/30 text-ember-600 text-sm">
            <Bell className="w-3.5 h-3.5" />
            <span>{pendingCount} pending</span>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl bg-white border border-cream-300 shadow-soft overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-cream-100 text-left text-ink-50 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Customer</th><th>Date</th><th>Amount</th><th>Shipping</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-ink-50">No orders yet.</td></tr>
            )}
            {orders.map((o) => {
              const isNew = o.id === highlightedId;
              return (
                <tr
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className={`hover:bg-cream-100 cursor-pointer transition-colors ${
                    isNew ? 'bg-ember-500/10 animate-reveal-up' : ''
                  }`}
                >
                  <td className="px-5 py-3 font-medium text-ink-900">{o.customer_name}</td>
                  <td className="text-ink-50">{o.created_at ? new Date(o.created_at).toLocaleDateString() : ''}</td>
                  <td className="font-medium">₱{Number(o.total).toLocaleString()}</td>
                  <td className="text-xs">
                    {o.tracking_number ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700">
                        <Truck className="w-3.5 h-3.5" />
                        {getCourierLabel(o.courier) || 'Shipped'}
                      </span>
                    ) : <span className="text-ink-50">Not shipped</span>}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      value={o.status}
                      onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[o.status]}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td onClick={(e) => e.stopPropagation()} className="pr-3">
                    <Link
                      href={`/admin/orders/${o.id}/receipt`}
                      target="_blank"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-cream-200 text-ink-500 hover:text-ember-500 transition"
                      title="View receipt"
                    >
                      <Receipt className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm grid place-items-center p-4 z-50 animate-reveal-up">
      <div className="bg-cream-50 rounded-2xl p-6 sm:p-7 w-full max-w-lg border border-cream-300 shadow-card max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-ember-500 font-medium">— Order</div>
            <h3 className="mt-1 font-serif text-xl font-semibold text-ink-900">Order details</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href={`/admin/orders/${order.id}/receipt`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm bg-ember-500 hover:bg-ember-400 text-cream-50 font-medium px-3 py-2 rounded-lg transition shadow-md shadow-ember-500/20"
              title="View / download receipt"
            >
              <Receipt className="w-4 h-4" /> Receipt
            </Link>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-cream-200 transition" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-sm space-y-1.5">
          <Row label="Customer" value={order.customer_name} />
          <Row label="Email" value={order.customer_email} />
          <Row label="Address" value={order.customer_address} />
          <Row label="Type" value={order.type} />
          {order.note && <Row label="Note" value={order.note} />}
        </div>

        <ShippingSection order={order} />

        {order.tracking_number && order.courier && order.courier !== 'other' && (
          <NotifyCustomerSection order={order} />
        )}

        <div className="mt-5 border-t border-cream-300 pt-4">
          <h4 className="font-medium mb-3 text-ink-900">Items</h4>
          <ul className="divide-y divide-cream-200 text-sm">
            {order.items.map((it, i) => (
              <li key={i} className="py-2.5 flex justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-ink-900">{it.name} × {it.quantity}</div>
                  {it.weight_kg > 0 && (
                    <div className="text-xs text-ink-50 mt-0.5">
                      {it.weight_kg.toFixed(2)} kg × {it.quantity} = {(it.weight_subtotal || it.weight_kg * it.quantity).toFixed(2)} kg
                    </div>
                  )}
                </div>
                <span className="font-medium whitespace-nowrap">₱{Number(it.subtotal).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          {order.total_weight_kg > 0 && (
            <div className="mt-4 flex justify-between text-sm text-ink-500 border-t border-cream-300 pt-3">
              <span>Total weight</span>
              <span className="font-medium text-ink-900">{Number(order.total_weight_kg).toFixed(2)} kg</span>
            </div>
          )}
          <div className="mt-2 flex justify-between font-serif text-lg font-semibold">
            <span>Total</span><span className="text-ember-500">₱{Number(order.total).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShippingSection({ order }: { order: Order }) {
  const [courier, setCourier] = useState<Courier>(order.courier || '');
  const [tn, setTn] = useState(order.tracking_number || '');
  const [saving, setSaving] = useState(false);

  const trackUrl = getTrackingUrl(courier, tn);
  const hasTrackingSaved = !!order.tracking_number;

  const save = async () => {
    setSaving(true);
    try {
      await api(`/orders/${order.id}/shipping`, {
        method: 'PATCH',
        body: JSON.stringify({ courier, tracking_number: tn }),
      });
      toast.success('Shipping info saved');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const clear = async () => {
    setCourier('');
    setTn('');
    setSaving(true);
    try {
      await api(`/orders/${order.id}/shipping`, {
        method: 'PATCH',
        body: JSON.stringify({ courier: '', tracking_number: '' }),
      });
      toast.success('Shipping info cleared');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const copyLink = () => {
    if (!trackUrl) return;
    navigator.clipboard.writeText(trackUrl);
    toast.success('Tracking link copied — share with customer');
  };
  const copyAwb = () => {
    if (!tn) return;
    navigator.clipboard.writeText(tn);
    toast.success('Tracking number copied');
  };

  return (
    <div className="mt-5 border-t border-cream-300 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <Truck className="w-4 h-4 text-ember-500" />
        <h4 className="font-medium text-ink-900">Shipping & tracking</h4>
        {hasTrackingSaved && (
          <span className="ml-auto text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            Tracked
          </span>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        <select
          value={courier}
          onChange={(e) => setCourier(e.target.value as Courier)}
          className="bg-white border border-cream-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500"
        >
          <option value="">Select courier...</option>
          {COURIER_OPTIONS.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
        <input
          value={tn}
          onChange={(e) => setTn(e.target.value.trim())}
          placeholder="Tracking / AWB number"
          className="bg-white border border-cream-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 items-center">
        <button
          onClick={save}
          disabled={saving || (!courier && !tn)}
          className="text-sm bg-ember-500 hover:bg-ember-400 text-cream-50 font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save shipping info'}
        </button>
        {hasTrackingSaved && (
          <button
            onClick={clear}
            disabled={saving}
            className="text-sm text-ink-50 hover:text-rose-600 transition px-2"
          >
            Clear
          </button>
        )}
        {trackUrl && tn && courier !== 'other' && (
          <>
            <a
              href={trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 text-sm bg-ink-900 hover:bg-ink-500 text-cream-50 font-medium px-4 py-2 rounded-lg transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Track on {getCourierLabel(courier).split(' ')[0]}
            </a>
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 text-sm border border-cream-300 hover:bg-cream-200 text-ink-500 px-3 py-2 rounded-lg transition"
              title="Copy tracking link to share with customer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {courier === 'other' && tn && (
        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-ink-50">No direct link for &ldquo;Other&rdquo; — </span>
          <button
            onClick={copyAwb}
            className="inline-flex items-center gap-1 text-ember-500 hover:text-ember-600 underline font-medium"
          >
            <Copy className="w-3 h-3" /> Copy tracking number
          </button>
          <span className="text-ink-50">and share manually.</span>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-ink-50 min-w-[80px]">{label}:</span>
      <span className="text-ink-900 break-words">{value}</span>
    </div>
  );
}

// Generates a ready-to-send shipping notification with tracking link.
// Admin copies once, pastes anywhere (Messenger, SMS, etc.).
function NotifyCustomerSection({ order }: { order: Order }) {
  const trackUrl = getTrackingUrl(order.courier, order.tracking_number);
  const courierName = getCourierLabel(order.courier) || 'the courier';
  const firstName = order.customer_name.split(' ')[0] || order.customer_name;

  const message =
`Hi ${firstName}! 📦

Your order from shwxn.bookstore is on the way!

Courier: ${courierName}
Tracking #: ${order.tracking_number}

Track your shipment here:
${trackUrl}

Salamat sa iyong pag order — abangan mo na lang yung delivery! 💚

— shwxn.bookstore`;

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success('Message copied — paste sa Messenger ng client');
  };

  const openMessenger = () => {
    navigator.clipboard.writeText(message);
    toast.success('Message copied — paste sa Messenger chat');
    window.open('https://www.messenger.com/', '_blank', 'noopener,noreferrer');
  };

  const emailHref = `mailto:${order.customer_email}?subject=${encodeURIComponent(
    `Your shwxn.bookstore order is shipped! 📦`
  )}&body=${encodeURIComponent(message)}`;

  return (
    <div className="mt-5 border-t border-cream-300 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <Send className="w-4 h-4 text-ember-500" />
        <h4 className="font-medium text-ink-900">Notify customer</h4>
      </div>

      {/* Preview */}
      <div className="rounded-xl bg-cream-100 border border-cream-300 p-3 mb-3 text-xs text-ink-500 font-mono leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
        {message}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={copyMessage}
          className="inline-flex items-center gap-1.5 text-sm bg-ember-500 hover:bg-ember-400 text-cream-50 font-medium px-4 py-2 rounded-lg transition shadow-md shadow-ember-500/20"
        >
          <Copy className="w-3.5 h-3.5" /> Copy message
        </button>
        <button
          onClick={openMessenger}
          className="inline-flex items-center gap-1.5 text-sm bg-[#0084FF] hover:bg-[#0073E0] text-white font-medium px-4 py-2 rounded-lg transition"
          title="Copy message + open Messenger"
        >
          <MessageCircle className="w-3.5 h-3.5" /> Open Messenger
        </button>
        <a
          href={emailHref}
          className="inline-flex items-center gap-1.5 text-sm border border-cream-300 hover:bg-cream-200 text-ink-500 font-medium px-4 py-2 rounded-lg transition"
        >
          <Mail className="w-3.5 h-3.5" /> Email
        </a>
      </div>
      <p className="mt-2 text-xs text-ink-50 italic">
        Tip: i-click ang &ldquo;Open Messenger&rdquo; → hanapin si {firstName} sa chats → paste (Ctrl+V).
      </p>
    </div>
  );
}
