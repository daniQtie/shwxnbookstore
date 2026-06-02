'use client';
import { useEffect, useState } from 'react';
import { api, uploadImage } from '@/lib/api';
import type { Category, Product } from '@/lib/types';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Weight } from 'lucide-react';
import PasswordConfirmModal from '@/components/PasswordConfirmModal';

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const load = () => Promise.all([api<Product[]>('/products'), api<Category[]>('/categories')])
    .then(([p, c]) => { setItems(p); setCats(c); }).catch(() => {});
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try { await api(`/products/${id}`, { method: 'DELETE' }); toast.success('Deleted'); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const deleteAll = async (password: string) => {
    const res = await api<{ deleted: number }>('/products/delete-all', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    toast.success(`Deleted ${res.deleted} products`);
    setDeleteAllOpen(false);
    load();
  };

  const catName = (id: string) => cats.find((c) => c.id === id)?.name || '—';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-900">Products</h1>
        <div className="flex gap-2">
          {items.length > 0 && (
            <button
              onClick={() => setDeleteAllOpen(true)}
              className="inline-flex items-center gap-2 border border-rose-200 hover:bg-rose-50 text-rose-600 font-medium px-4 py-2.5 rounded-xl transition"
            >
              <Trash2 className="w-4 h-4" /> Delete all
            </button>
          )}
          <button
            onClick={() => { setEditing(null); setOpen(true); }}
            className="inline-flex items-center gap-2 bg-ember-500 hover:bg-ember-400 text-cream-50 font-medium px-4 py-2.5 rounded-xl transition shadow-md shadow-ember-500/20"
          >
            <Plus className="w-4 h-4" /> Add product
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white border border-cream-300 shadow-soft overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-cream-100 text-left text-ink-50 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Image</th><th>Name</th><th>Category</th><th>Price</th><th>Weight</th><th>Stock</th><th>Featured</th><th>Active</th><th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-cream-100 transition">
                <td className="px-4 py-2">
                  {p.image_url ? <img src={p.image_url} alt="" className="w-12 h-16 object-cover rounded" /> : <div className="w-12 h-16 bg-cream-200 rounded" />}
                </td>
                <td className="font-medium text-ink-900">{p.name}</td>
                <td className="text-ink-50">{catName(p.category_id)}</td>
                <td className="font-medium">₱{Number(p.price).toLocaleString()}</td>
                <td className="text-ink-500">
                  {p.weight_kg > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Weight className="w-3 h-3 text-ink-50" /> {p.weight_kg.toFixed(2)} kg
                    </span>
                  ) : <span className="text-ink-50">—</span>}
                </td>
                <td>{p.stock}</td>
                <td>{p.is_featured ? 'Yes' : 'No'}</td>
                <td>{p.is_active ? 'Yes' : 'No'}</td>
                <td className="px-4 text-right whitespace-nowrap">
                  <button onClick={() => { setEditing(p); setOpen(true); }} className="p-1.5 hover:bg-cream-200 rounded transition"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(p.id)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded ml-1 transition"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && <ProductModal cats={cats} initial={editing} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
      {deleteAllOpen && (
        <PasswordConfirmModal
          title="Delete ALL products"
          warning={`This will permanently delete all ${items.length} products and their images references. This cannot be undone.`}
          confirmLabel="Yes, delete everything"
          destructive
          onConfirm={deleteAll}
          onClose={() => setDeleteAllOpen(false)}
        />
      )}
    </div>
  );
}

function ProductModal({ cats, initial, onClose, onSaved }: any) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    category_id: initial?.category_id || cats[0]?.id || '',
    description: initial?.description || '',
    price: initial?.price ?? 0,
    stock: initial?.stock ?? 0,
    weight_kg: initial?.weight_kg ?? 0,
    image_url: initial?.image_url || '',
    is_featured: initial?.is_featured ?? false,
    is_active: initial?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onFile = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setForm((f: any) => ({ ...f, image_url: url }));
      toast.success('Image uploaded');
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = JSON.stringify(form);
      if (initial) await api(`/products/${initial.id}`, { method: 'PUT', body });
      else await api('/products', { method: 'POST', body });
      toast.success('Saved');
      onSaved();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm grid place-items-center p-4 z-50 overflow-auto">
      <form onSubmit={submit} className="bg-cream-50 rounded-2xl p-6 sm:p-7 w-full max-w-2xl space-y-3 my-8 border border-cream-300 shadow-card">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-ember-500 font-medium">— Product</div>
          <h3 className="mt-1 font-serif text-xl font-semibold text-ink-900">
            {initial ? 'Edit' : 'Add'} product
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Name *">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </Field>
          <Field label="Category *">
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input">
              {cats.map((c: Category) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Price (₱) *">
            <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="input" />
          </Field>
          <Field label="Stock *">
            <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="input" />
          </Field>
          <Field label="Weight per book (kg)">
            <input type="number" step="0.01" min="0" max="100" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: Number(e.target.value) })} placeholder="e.g. 0.45" className="input" />
          </Field>
          <div /> {/* spacer */}
        </div>
        <Field label="Description">
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="input" />
        </Field>
        <Field label="Image">
          <div className="flex items-center gap-3 flex-wrap">
            {form.image_url && <img src={form.image_url} alt="" className="w-16 h-20 object-cover rounded-lg" />}
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} className="text-sm" />
            {uploading && <span className="text-sm text-ink-50">Uploading...</span>}
          </div>
        </Field>
        <div className="flex gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t border-cream-300">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl hover:bg-cream-200 transition">Cancel</button>
          <button disabled={saving} className="px-5 py-2.5 rounded-xl bg-ember-500 hover:bg-ember-400 text-cream-50 font-medium transition disabled:opacity-50 shadow-md shadow-ember-500/20">
            {saving ? 'Saving...' : 'Save product'}
          </button>
        </div>
        <style jsx>{`
          .input {
            width: 100%;
            background: white;
            border: 1px solid #E8D9C4;
            border-radius: 0.75rem;
            padding: 0.625rem 0.75rem;
            font-size: 0.95rem;
            transition: all 0.15s;
          }
          .input:focus { outline: 2px solid rgba(180,83,9,0.4); border-color: #B45309; }
        `}</style>
      </form>
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <label className="block">
      <div className="text-sm text-ink-500 font-medium mb-1">{label}</div>
      {children}
    </label>
  );
}
