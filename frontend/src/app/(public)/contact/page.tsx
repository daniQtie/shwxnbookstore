'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, MapPin, Phone } from 'lucide-react';
import Reveal from '@/components/Reveal';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Salamat! We&apos;ll reply within 1-2 business days.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-12">
      <Reveal>
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-ember-500 font-medium">— Say hello</span>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl font-semibold tracking-tight text-ink-900">
            Get in touch.
          </h1>
          <p className="text-ink-50 mt-3 text-lg">Questions about pre-orders or partnerships? Drop us a line.</p>
          <div className="mt-10 space-y-4 text-ink-500">
            <ContactItem icon={Mail} text="hello@shwxnbookstore.ph" />
            <ContactItem icon={Phone} text="+63 900 000 0000" />
            <ContactItem icon={MapPin} text="Metro Manila, Philippines" />
          </div>
        </div>
      </Reveal>
      <Reveal delay={1}>
        <form onSubmit={submit} className="rounded-2xl bg-cream-50 border border-cream-300 p-7 shadow-soft space-y-3">
          <input
            required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name" className="w-full rounded-xl bg-white border border-cream-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500 transition"
          />
          <input
            required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email" className="w-full rounded-xl bg-white border border-cream-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500 transition"
          />
          <textarea
            required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Your message" className="w-full rounded-xl bg-white border border-cream-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500 transition"
          />
          <button className="w-full bg-ember-500 hover:bg-ember-400 text-cream-50 font-medium py-3 rounded-xl transition shadow-md shadow-ember-500/20">
            Send message
          </button>
        </form>
      </Reveal>
    </div>
  );
}

function ContactItem({ icon: Icon, text }: any) {
  return (
    <div className="flex items-center gap-3 group">
      <span className="w-10 h-10 rounded-xl bg-ember-500/10 grid place-items-center group-hover:bg-ember-500/20 transition">
        <Icon className="w-4 h-4 text-ember-500" />
      </span>
      <span>{text}</span>
    </div>
  );
}
