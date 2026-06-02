'use client';
import { useState } from 'react';
import { X, Lock, AlertTriangle } from 'lucide-react';

type Props = {
  title: string;
  warning?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: (password: string) => Promise<void>;
  onClose: () => void;
};

// Reusable modal for sensitive operations. Asks the admin to re-enter their password.
// Caller's onConfirm should call the backend (which re-verifies the password).
export default function PasswordConfirmModal({
  title,
  warning,
  confirmLabel = 'Confirm',
  destructive = false,
  onConfirm,
  onClose,
}: Props) {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setSubmitting(true);
    setError('');
    try {
      await onConfirm(password);
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm grid place-items-center p-4 z-50 animate-reveal-up">
      <form onSubmit={submit} className="bg-cream-50 rounded-2xl p-6 sm:p-7 w-full max-w-md border border-cream-300 shadow-card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl grid place-items-center ${destructive ? 'bg-rose-100' : 'bg-ember-500/10'}`}>
              {destructive ? <AlertTriangle className="w-5 h-5 text-rose-600" /> : <Lock className="w-5 h-5 text-ember-500" />}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-ember-500 font-medium">— Confirm</div>
              <h3 className="mt-0.5 font-serif text-lg font-semibold text-ink-900">{title}</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-cream-200 transition" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {warning && (
          <div className="mt-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 leading-relaxed">
            {warning}
          </div>
        )}

        <label className="block mt-4">
          <div className="text-sm text-ink-500 font-medium mb-1.5">Enter your admin password to continue</div>
          <input
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Current password"
            className="w-full rounded-xl bg-white border border-cream-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500"
          />
        </label>

        {error && (
          <div className="mt-3 text-sm text-rose-600 font-medium">{error}</div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl hover:bg-cream-200 text-ink-500 transition">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !password}
            className={`px-5 py-2.5 rounded-xl font-medium transition disabled:opacity-50 shadow-md ${
              destructive
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                : 'bg-ember-500 hover:bg-ember-400 text-cream-50 shadow-ember-500/20'
            }`}
          >
            {submitting ? 'Working...' : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
