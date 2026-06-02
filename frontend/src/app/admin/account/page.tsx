'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { User, Lock, Save, AlertCircle } from 'lucide-react';

type Me = { id: string; username: string; name: string };

export default function AccountSettingsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [form, setForm] = useState({
    name: '',
    username: '',
    new_password: '',
    new_password_confirm: '',
    current_password: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ user: Me }>('/auth/me')
      .then(({ user }) => {
        setMe(user);
        setForm((f) => ({ ...f, name: user.name || '', username: user.username || '' }));
      })
      .catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.current_password) {
      toast.error('Enter your current password to save changes');
      return;
    }
    if (form.new_password && form.new_password !== form.new_password_confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (form.new_password && form.new_password.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        current_password: form.current_password,
        name: form.name,
        username: form.username,
      };
      if (form.new_password) payload.new_password = form.new_password;

      const res = await api<{ user: Me }>('/auth/account', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setMe(res.user);
      setForm((f) => ({ ...f, new_password: '', new_password_confirm: '', current_password: '' }));
      toast.success('Account updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-900">Account settings</h1>
        <p className="text-sm text-ink-50 mt-1">Update your display name, username, or password.</p>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-6">
        {/* Profile section */}
        <section className="rounded-2xl bg-white border border-cream-300 p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-ember-500" />
            <h2 className="font-serif font-semibold text-ink-900">Profile</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Display name">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Shawn"
                maxLength={120}
                className="input"
              />
            </Field>
            <Field label="Username">
              <input
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                minLength={3}
                maxLength={64}
                className="input"
              />
            </Field>
          </div>
        </section>

        {/* Password section */}
        <section className="rounded-2xl bg-white border border-cream-300 p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-ember-500" />
            <h2 className="font-serif font-semibold text-ink-900">Change password</h2>
          </div>
          <p className="text-xs text-ink-50 mb-4">Leave blank if you don&apos;t want to change your password.</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="New password">
              <input
                type="password"
                value={form.new_password}
                onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                minLength={6}
                placeholder="At least 6 characters"
                className="input"
              />
            </Field>
            <Field label="Confirm new password">
              <input
                type="password"
                value={form.new_password_confirm}
                onChange={(e) => setForm({ ...form, new_password_confirm: e.target.value })}
                placeholder="Re-enter new password"
                className="input"
              />
            </Field>
          </div>
        </section>

        {/* Confirm with current password */}
        <section className="rounded-2xl bg-ember-500/5 border border-ember-500/30 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-ember-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-ink-900">Confirm with current password</h3>
              <p className="text-sm text-ink-500 mt-1">
                For security, please re-enter your current password to save any change.
              </p>
              <input
                type="password"
                required
                value={form.current_password}
                onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                placeholder="Current password"
                className="input mt-3"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-ember-500 hover:bg-ember-400 text-cream-50 font-medium px-6 py-3 rounded-xl transition disabled:opacity-50 shadow-md shadow-ember-500/30"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>

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
