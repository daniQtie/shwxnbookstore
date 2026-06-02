'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Category } from '@/lib/types';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PasswordConfirmModal from '@/components/PasswordConfirmModal';

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const load = () => api<Category[]>('/categories').then(setCats).catch(() => {});
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try { await api(`/categories/${id}`, { method: 'DELETE' }); toast.success('Deleted'); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const deleteAll = async (password: string) => {
    const res = await api<{ deleted: number }>('/categories/delete-all', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    toast.success(`Deleted ${res.deleted} categories`);
    setDeleteAllOpen(false);
    load();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-900">Categories</h1>
        <div className="flex gap-2">
          {cats.length > 0 && (
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
            <Plus className="w-4 h-4" /> Add category
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white border border-slate-200 shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr><th className="px-4 py-3">Name</th><th>Slug</th><th>Description</th><th></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cats.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="text-slate-500">{c.slug}</td>
                <td className="text-slate-500 truncate max-w-md">{c.description}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditing(c); setOpen(true); }} className="p-1.5 hover:bg-slate-100 rounded"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(c.id)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded ml-1"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && <CategoryModal initial={editing} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
      {deleteAllOpen && (
        <PasswordConfirmModal
          title="Delete ALL categories"
          warning={`This will permanently delete all ${cats.length} categories. Products will keep their category_id but the references will point to nothing. This cannot be undone.`}
          confirmLabel="Yes, delete everything"
          destructive
          onConfirm={deleteAll}
          onClose={() => setDeleteAllOpen(false)}
        />
      )}
    </div>
  );
}

function CategoryModal({ initial, onClose, onSaved }: { initial: Category | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: initial?.name || '', description: initial?.description || '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (initial) await api(`/categories/${initial.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await api('/categories', { method: 'POST', body: JSON.stringify(form) });
      toast.success('Saved');
      onSaved();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 grid place-items-center p-4 z-50">
      <form onSubmit={submit} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3">
        <h3 className="font-semibold">{initial ? 'Edit' : 'Add'} category</h3>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full rounded-xl border border-slate-300 px-3 py-2" />
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl hover:bg-slate-100">Cancel</button>
          <button disabled={saving} className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-900 font-medium hover:bg-emerald-400">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
