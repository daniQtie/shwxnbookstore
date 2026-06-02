'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
};

// Scroll-triggered fade-up via IntersectionObserver. Add a single CSS class when in view.
export default function Reveal({ children, delay = 0, as = 'div', className = '' }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setSeen(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  const Tag = as as any;
  return (
    <Tag
      ref={ref}
      data-delay={delay || undefined}
      className={`reveal ${seen ? 'reveal-in' : ''} ${className}`}
    >
      {children}
    </Tag>
  );
}
