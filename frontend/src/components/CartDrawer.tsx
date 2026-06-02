'use client';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Weight } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CartDrawer() {
  const { items, isOpen, closeCart, setQty, remove, totalPrice, totalWeight, itemCount, clear } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', note: '' });

  const onCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api('/orders/preorder', {
        method: 'POST',
        body: JSON.stringify({
          customer: { name: form.name, email: form.email, phone: form.phone, address: form.address },
          items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
          note: form.note,
        }),
      });
      toast.success('Pre-order placed! We&apos;ll be in touch.');
      clear();
      closeCart();
      setCheckingOut(false);
      setForm({ name: '', email: '', phone: '', address: '', note: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-ink-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[440px] bg-cream-50 border-l border-cream-300 shadow-card flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-5 border-b border-cream-300 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ember-500 font-medium">— Your selection</div>
            <h2 className="mt-1 font-serif text-xl font-semibold text-ink-900">
              {checkingOut ? 'Pre-order details' : `Cart (${itemCount})`}
            </h2>
          </div>
          <button onClick={closeCart} className="p-2 rounded-lg hover:bg-cream-200 transition" aria-label="Close cart">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {!checkingOut ? (
            <CartList items={items} setQty={setQty} remove={remove} />
          ) : (
            <CheckoutForm form={form} setForm={setForm} />
          )}
        </div>

        {/* Footer / totals */}
        {items.length > 0 && (
          <div className="border-t border-cream-300 bg-cream-100/60 backdrop-blur p-5 sm:p-6 space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-2 text-sm text-ink-50">
                <Weight className="w-3.5 h-3.5" />
                <span>Total weight</span>
              </div>
              <div className="font-serif text-lg font-semibold text-ink-900">
                {totalWeight.toFixed(2)} <span className="text-sm text-ink-50">kg</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink-50">Subtotal</span>
              <div className="font-serif text-2xl font-semibold text-ember-500">
                ₱{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {!checkingOut ? (
              <button
                onClick={() => setCheckingOut(true)}
                className="w-full bg-ember-500 hover:bg-ember-400 text-cream-50 font-medium py-3.5 rounded-xl transition shadow-lg shadow-ember-500/30 hover:shadow-ember-500/50 inline-flex items-center justify-center gap-2"
              >
                Continue to pre-order <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCheckingOut(false)}
                  className="flex-1 border border-cream-300 hover:bg-cream-200 text-ink-500 font-medium py-3 rounded-xl transition"
                >
                  Back
                </button>
                <button
                  onClick={onCheckout as any}
                  disabled={submitting || !form.name || !form.email || !form.address}
                  className="flex-[1.5] bg-ember-500 hover:bg-ember-400 text-cream-50 font-medium py-3 rounded-xl transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Place pre-order'}
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

function CartList({ items, setQty, remove }: any) {
  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-ink-50">
        <div className="w-16 h-16 rounded-2xl bg-cream-200 grid place-items-center mb-4">
          <ShoppingBag className="w-7 h-7 text-ember-500/60" />
        </div>
        <h3 className="font-serif text-xl text-ink-900">Your cart is empty</h3>
        <p className="mt-2 text-sm max-w-xs">Add books from the catalog and they&apos;ll appear here.</p>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-cream-200">
      {items.map((it: any) => (
        <li key={it.product_id} className="p-5 flex gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={it.image_url} alt={it.name} className="w-16 h-20 object-cover rounded-lg bg-cream-200 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-serif text-ink-900 font-medium leading-tight line-clamp-2">{it.name}</div>
            <div className="text-xs text-ink-50 mt-1">
              {it.weight_kg ? `${it.weight_kg.toFixed(2)} kg each` : 'No weight set'}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="inline-flex items-center border border-cream-300 rounded-lg bg-white">
                <button
                  onClick={() => setQty(it.product_id, it.quantity - 1)}
                  className="p-1.5 hover:bg-cream-100 transition rounded-l-lg"
                  aria-label="Decrease"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-sm font-medium min-w-[2ch] text-center">{it.quantity}</span>
                <button
                  onClick={() => setQty(it.product_id, it.quantity + 1)}
                  disabled={it.quantity >= it.stock}
                  className="p-1.5 hover:bg-cream-100 transition rounded-r-lg disabled:opacity-30"
                  aria-label="Increase"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-right">
                <div className="font-medium text-ember-500">
                  ₱{(it.price * it.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <button
                  onClick={() => remove(it.product_id)}
                  className="text-xs text-ink-50 hover:text-rose-600 transition inline-flex items-center gap-1 mt-1"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CheckoutForm({ form, setForm }: any) {
  return (
    <form className="p-5 sm:p-6 space-y-3" onSubmit={(e) => e.preventDefault()}>
      <Field label="Full name" required>
        <input
          required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input"
        />
      </Field>
      <Field label="Email" required>
        <input
          required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input"
        />
      </Field>
      <Field label="Phone (optional)">
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
      </Field>
      <Field label="Delivery address" required>
        <textarea
          required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="input"
        />
      </Field>
      <Field label="Note (optional)">
        <textarea
          rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
          className="input"
        />
      </Field>
      <style jsx>{`
        .input {
          width: 100%;
          background: white;
          border: 1px solid #E8D9C4;
          border-radius: 0.75rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.95rem;
        }
        .input:focus { outline: 2px solid rgba(180,83,9,0.4); border-color: #B45309; }
      `}</style>
    </form>
  );
}

function Field({ label, required, children }: any) {
  return (
    <label className="block">
      <div className="text-sm text-ink-500 font-medium mb-1">
        {label} {required && <span className="text-ember-500">*</span>}
      </div>
      {children}
    </label>
  );
}
