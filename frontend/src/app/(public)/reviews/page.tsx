'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Review } from '@/lib/types';
import toast from 'react-hot-toast';
import { Star, Quote } from 'lucide-react';
import Reveal from '@/components/Reveal';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState({ customer_name: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => api<Review[]>('/reviews').then(setReviews).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api('/reviews', { method: 'POST', body: JSON.stringify(form) });
      toast.success('Salamat! Your review is awaiting approval.');
      setForm({ customer_name: '', rating: 5, comment: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Reveal>
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.2em] text-ember-500 font-medium">— Word of mouth</span>
          <h1 className="mt-2 font-serif text-4xl md:text-6xl font-semibold tracking-tight text-ink-900">
            Reviews.
          </h1>
          <p className="text-ink-50 mt-3 text-lg">Share what you&apos;ve loved reading.</p>
        </div>
      </Reveal>

      <Reveal delay={1}>
        <form onSubmit={submit} className="mt-12 rounded-2xl bg-cream-50 border border-cream-300 p-7 shadow-soft space-y-4">
          <h2 className="font-serif text-xl font-semibold">Leave a review</h2>
          <input
            required maxLength={120}
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            placeholder="Your name"
            className="w-full rounded-xl bg-white border border-cream-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500 transition"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-500 font-medium">Rating:</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setForm({ ...form, rating: n })} className="transition hover:scale-110">
                <Star className={`w-6 h-6 ${n <= form.rating ? 'text-ember-500 fill-current' : 'text-cream-300'}`} />
              </button>
            ))}
          </div>
          <textarea
            required maxLength={1000} rows={4}
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            placeholder="Share your thoughts..."
            className="w-full rounded-xl bg-white border border-cream-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500 transition"
          />
          <button disabled={submitting} className="bg-ember-500 hover:bg-ember-400 text-cream-50 font-medium px-6 py-3 rounded-xl transition disabled:opacity-50 shadow-md shadow-ember-500/20">
            {submitting ? 'Submitting...' : 'Submit review'}
          </button>
        </form>
      </Reveal>

      <div className="mt-12 grid md:grid-cols-2 gap-5">
        {reviews.map((r, i) => (
          <Reveal key={r.id} delay={(Math.min(i % 5, 4)) as 0 | 1 | 2 | 3 | 4}>
            <div className="relative rounded-2xl bg-cream-50 border border-cream-300 p-6 shadow-soft hover:shadow-card transition">
              <Quote className="absolute -top-3 left-5 w-7 h-7 text-ember-500 fill-ember-500/10" />
              <div className="flex items-center gap-1 text-ember-500 mt-1">
                {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="mt-3 font-serif italic text-lg text-ink-500 leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
              <div className="mt-4 text-sm text-ink-50">— {r.customer_name}</div>
            </div>
          </Reveal>
        ))}
        {reviews.length === 0 && <div className="text-ink-50 col-span-full font-serif italic">No reviews yet. Be the first!</div>}
      </div>
    </div>
  );
}
