import { Platform } from 'react-native';

// Use the live Aite-lite backend. Override with EXPO_PUBLIC_API_BASE for local dev.
// On web we default to a relative path so Vercel / host rewrites can proxy to the API.
const defaultBase = Platform.OS === 'web' ? '' : 'https://aite-lite.vercel.app';
export const API_BASE =
  (typeof process !== 'undefined' && process.env && (process.env as any).EXPO_PUBLIC_API_BASE) ||
  defaultBase;

// On web we proxy through the same origin via vercel.json rewrites, so use
// same-origin mode to avoid sending the Origin header and triggering CORS.
const isWeb = Platform.OS === 'web';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    mode: isWeb ? 'same-origin' : ('cors' as RequestMode),
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = (await res.json().catch(() => ({}))) as any;
  return { ok: res.ok && data.ok !== false, status: res.status, data };
}

export async function apiFetchRaw(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  return fetch(url, {
    ...options,
    mode: isWeb ? 'same-origin' : ('cors' as RequestMode),
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}
