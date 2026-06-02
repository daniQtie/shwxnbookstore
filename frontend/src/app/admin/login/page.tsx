'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { BookOpen } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      localStorage.setItem('token', res.token);
      toast.success('Welcome back');
      router.push('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-900 text-white p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-6 h-6 text-emerald-400" />
          <span className="font-semibold">shwxnbookstore admin</span>
        </div>
        <label className="text-sm text-slate-300">Username</label>
        <input
          required value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="mt-1 w-full rounded-xl bg-slate-700 border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <label className="text-sm text-slate-300 mt-4 block">Password</label>
        <input
          required type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="mt-1 w-full rounded-xl bg-slate-700 border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button disabled={loading} className="mt-6 w-full bg-emerald-500 text-slate-900 font-medium py-2.5 rounded-xl hover:bg-emerald-400 disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
