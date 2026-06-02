const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
    credentials: 'include',
  });
  const ct = res.headers.get('content-type') || '';
  const body = ct.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = (body && typeof body === 'object' && (body as any).error) || `HTTP ${res.status}`;
    throw new ApiError(res.status, msg, body);
  }
  return body as T;
}

export async function uploadImage(file: File): Promise<{ url: string; public_id: string }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`${BASE}/upload/image`, {
    method: 'POST',
    body: fd,
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new ApiError(res.status, data.error || 'Upload failed');
  return data;
}
