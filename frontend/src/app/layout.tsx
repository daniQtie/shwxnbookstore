import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/lib/cart';
import CartDrawer from '@/components/CartDrawer';
import './globals.css';

export const metadata: Metadata = {
  title: 'shwxnbookstore — Curated books online',
  description: 'A modern online bookstore. Browse, pre-order, and review.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
        <Toaster position="top-right" toastOptions={{ className: 'rounded-xl' }} />
      </body>
    </html>
  );
}
