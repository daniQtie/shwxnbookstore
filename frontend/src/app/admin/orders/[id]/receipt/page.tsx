'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Order } from '@/lib/types';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';
import { Download, Printer, ArrowLeft, BookOpen, Truck } from 'lucide-react';
import Link from 'next/link';
import { getCourierLabel } from '@/lib/couriers';

const STATUS_LABEL: Record<string, string> = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  processing: 'PROCESSING',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
};

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<Order>(`/orders/${id}`)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  const downloadPng = async () => {
    if (!receiptRef.current || !order) return;
    setDownloading(true);

    // Clone the receipt into a fresh off-screen container with fixed dimensions.
    // This bypasses any parent layout (sidebar, flex, scroll) that might clip the capture.
    const targetWidth = 640;
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position: fixed;
      top: 0;
      left: -20000px;
      width: ${targetWidth}px;
      background: #FBF7F0;
      z-index: -1;
    `;
    const clone = receiptRef.current.cloneNode(true) as HTMLElement;
    clone.style.width = `${targetWidth}px`;
    clone.style.maxWidth = `${targetWidth}px`;
    clone.style.margin = '0';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      // Wait for fonts and layout to settle
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise((r) => setTimeout(r, 80));

      const fullHeight = clone.scrollHeight;

      const dataUrl = await toPng(clone, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#FBF7F0',
        width: targetWidth,
        height: fullHeight,
      });

      const link = document.createElement('a');
      link.download = `receipt-${order.customer_name.replace(/\s+/g, '_')}-${order.id.slice(0, 6)}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Receipt downloaded — drag to Messenger to send');
    } catch (e: any) {
      toast.error('Failed to generate image');
      console.error(e);
    } finally {
      document.body.removeChild(wrapper);
      setDownloading(false);
    }
  };

  const printReceipt = () => window.print();

  if (loading) return <div className="p-12 text-ink-50">Loading receipt...</div>;
  if (!order) return <div className="p-12 font-serif text-2xl italic">Order not found.</div>;

  const orderShort = order.id.slice(0, 8).toUpperCase();
  const dateStr = order.created_at ? new Date(order.created_at).toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }) : '';

  return (
    <div className="min-h-screen bg-cream-200 py-8 px-4">
      {/* Action bar — hidden when printing */}
      <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between flex-wrap gap-3 print:hidden">
        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-ink-50 hover:text-ember-500 transition">
          <ArrowLeft className="w-4 h-4" /> Back to orders
        </Link>
        <div className="flex gap-2">
          <button
            onClick={printReceipt}
            className="inline-flex items-center gap-1.5 text-sm bg-white border border-cream-300 hover:bg-cream-100 text-ink-900 font-medium px-4 py-2 rounded-lg transition"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
          <button
            onClick={downloadPng}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 text-sm bg-ember-500 hover:bg-ember-400 text-cream-50 font-medium px-4 py-2 rounded-lg transition shadow-md shadow-ember-500/30 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {downloading ? 'Generating...' : 'Download PNG'}
          </button>
        </div>
      </div>

      {/* Receipt card */}
      <div
        ref={receiptRef}
        className="receipt-card max-w-2xl mx-auto bg-cream-50 rounded-3xl shadow-card overflow-hidden border border-cream-300"
      >
        {/* Header — ink with ember accent */}
        <div className="bg-ink-900 text-cream-100 px-8 py-7 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-ember-500/20 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-ember-400" />
              <div>
                <div className="font-serif text-xl font-semibold">shwxn<span className="text-ember-400">.</span>bookstore</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-cream-200/60 mt-0.5">Order Receipt</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-cream-200/60">Status</div>
              <div className={`mt-1 inline-block text-xs font-bold tracking-wider px-2.5 py-1 rounded-full ${
                order.status === 'completed' ? 'bg-emerald-500 text-ink-900' :
                order.status === 'pending' ? 'bg-ember-500 text-ink-900' :
                order.status === 'cancelled' ? 'bg-cream-200 text-ink-900' :
                'bg-cream-100/15 text-cream-100'
              }`}>
                {STATUS_LABEL[order.status]}
              </div>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-8 py-5 bg-cream-100/50 border-b border-cream-300 text-sm">
          <Meta label="Order #" value={`#${orderShort}`} />
          <Meta label="Date" value={dateStr} />
          <Meta label="Type" value={order.type === 'preorder' ? 'Pre-order' : order.type} />
        </div>

        {/* Customer */}
        <div className="px-8 py-6 border-b border-cream-300">
          <div className="text-[10px] uppercase tracking-[0.2em] text-ember-500 font-medium">— Bill to</div>
          <div className="mt-2 font-serif text-xl font-semibold text-ink-900">{order.customer_name}</div>
          <div className="mt-1 text-sm text-ink-500">{order.customer_email}</div>
          <div className="mt-2 text-sm text-ink-500 max-w-md">{order.customer_address}</div>
          {order.note && (
            <div className="mt-3 text-xs text-ink-50 italic bg-cream-100 rounded-lg px-3 py-2">
              Note: {order.note}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="px-8 py-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-ember-500 font-medium mb-3">— Items</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-ink-50 text-xs uppercase tracking-wider border-b border-cream-300">
                <th className="text-left pb-2 font-medium">Title</th>
                <th className="text-center pb-2 font-medium">Qty</th>
                <th className="text-right pb-2 font-medium">Price</th>
                <th className="text-right pb-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {order.items.map((it, i) => (
                <tr key={i}>
                  <td className="py-3 pr-2">
                    <div className="text-ink-900 font-medium leading-tight">{it.name}</div>
                    {it.weight_kg > 0 && (
                      <div className="text-[11px] text-ink-50 mt-0.5">{it.weight_kg.toFixed(2)} kg each</div>
                    )}
                  </td>
                  <td className="py-3 text-center text-ink-500">{it.quantity}</td>
                  <td className="py-3 text-right text-ink-500 whitespace-nowrap">
                    ₱{Number(it.price).toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-medium text-ink-900 whitespace-nowrap">
                    ₱{Number(it.subtotal).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-8 py-5 bg-cream-100/50 border-y border-cream-300">
          {order.total_weight_kg > 0 && (
            <div className="flex justify-between text-sm text-ink-500 py-1">
              <span>Total weight</span>
              <span className="font-medium text-ink-900">{Number(order.total_weight_kg).toFixed(2)} kg</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-3 mt-2 border-t border-cream-300">
            <span className="font-serif text-lg font-semibold text-ink-900">Grand Total</span>
            <span className="font-serif text-3xl font-bold text-ember-500">
              ₱{Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Shipping (if any) */}
        {order.tracking_number && (
          <div className="px-8 py-5 border-b border-cream-300 bg-emerald-50/50">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald-700 font-medium">
              <Truck className="w-3.5 h-3.5" />
              Shipping info
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-ink-50 text-xs">Courier</div>
                <div className="font-medium text-ink-900">{getCourierLabel(order.courier) || '—'}</div>
              </div>
              <div>
                <div className="text-ink-50 text-xs">Tracking #</div>
                <div className="font-mono font-medium text-ink-900 text-xs sm:text-sm break-all">{order.tracking_number}</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-6 text-center">
          <div className="font-serif italic text-ink-500 text-sm">
            Salamat sa iyong pre-order!
          </div>
          <div className="mt-1 text-xs text-ink-50">
            Questions? Reach us via Messenger or hello@shwxnbookstore.ph
          </div>
          <div className="mt-4 pt-4 border-t border-cream-300 text-[10px] uppercase tracking-[0.2em] text-ink-50">
            shwxn.bookstore · Curated for readers
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .receipt-card { box-shadow: none !important; border: 1px solid #E8D9C4 !important; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-50">{label}</div>
      <div className="mt-0.5 font-medium text-ink-900 truncate">{value}</div>
    </div>
  );
}
