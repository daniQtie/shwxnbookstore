'use client';
import { useEffect, useRef } from 'react';
import { getDb } from './firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

type Options = {
  // Firestore collection to subscribe to (when allowed by security rules)
  collectionName: string;
  // Fallback: REST endpoint to poll
  fallbackPath: string;
  // Polling interval in ms when Firestore is unavailable
  pollIntervalMs?: number;
  // Called whenever fresh data arrives
  onData: (rows: any[]) => void;
};

// Realtime data hook that prefers Firestore onSnapshot but falls back to
// polling the backend REST endpoint when Firestore reads are blocked by rules.
export function useRealtime({ collectionName, fallbackPath, pollIntervalMs = 4000, onData }: Options) {
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let unsub: (() => void) | null = null;

    const startPolling = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
      const fetchOnce = async () => {
        try {
          const res = await fetch(`${base}${fallbackPath}`, {
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (!res.ok) return;
          const data = await res.json();
          if (!cancelled) onDataRef.current(data);
        } catch {
          // ignore — will retry on next interval
        }
      };
      await fetchOnce();
      pollTimer = setInterval(fetchOnce, pollIntervalMs);
    };

    const db = getDb();
    if (!db) {
      startPolling();
      return () => { cancelled = true; if (pollTimer) clearInterval(pollTimer); };
    }

    // Try Firestore realtime first
    const q = query(collection(db, collectionName), orderBy('created_at', 'desc'));
    let firstResponseReceived = false;

    unsub = onSnapshot(
      q,
      (snap) => {
        firstResponseReceived = true;
        const rows = snap.docs.map((d) => {
          const data: any = d.data();
          // Convert Firestore Timestamps → ISO strings to match REST shape
          return {
            id: d.id,
            ...data,
            created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : data.created_at,
            updated_at: data.updated_at?.toDate ? data.updated_at.toDate().toISOString() : data.updated_at,
          };
        });
        if (!cancelled) onDataRef.current(rows);
      },
      (err) => {
        // Firestore blocked (rules) — fall back to polling
        console.warn(`[realtime ${collectionName}] Firestore blocked, falling back to polling:`, err.code);
        if (unsub) unsub();
        unsub = null;
        if (!cancelled) startPolling();
      }
    );

    // Safety: if Firestore never responds within 3s, also start polling as a backup
    const safetyTimer = setTimeout(() => {
      if (!firstResponseReceived && !cancelled && !pollTimer) {
        startPolling();
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
      if (unsub) unsub();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [collectionName, fallbackPath, pollIntervalMs]);
}
