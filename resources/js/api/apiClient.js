/**
 * HTTP client for Laravel /api (Sanctum SPA cookie auth).
 */

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[$()*+./?[\\\]^{|}-]/g, '\\$&')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function csrfToken() {
  return (
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    || getCookie('XSRF-TOKEN')
  );
}

let csrfReady = false;

export async function ensureCsrf() {
  if (csrfReady && csrfToken()) return;
  await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
  csrfReady = true;
}

export async function apiFetch(path, { method = 'GET', body, headers = {} } = {}) {
  if (method !== 'GET' && method !== 'HEAD') {
    await ensureCsrf();
  }

  const url = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;
  const opts = {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...headers,
    },
  };

  const token = csrfToken();
  if (token) opts.headers['X-XSRF-TOKEN'] = token;

  if (body !== undefined) {
    if (body instanceof FormData) {
      opts.body = body;
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }

  const res = await fetch(url, opts);
  let json = null;
  const text = await res.text();
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { message: text };
  }

  if (!res.ok) {
    const err = new Error(json?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = json;
    throw err;
  }

  return json;
}

export default apiFetch;
