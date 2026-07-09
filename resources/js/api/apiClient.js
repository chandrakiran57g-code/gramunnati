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

/** Fired after every successful admin mutation so the UI can confirm the save. */
export const ADMIN_SAVED_EVENT = 'cmsr:admin-saved';

function firstValidationError(json) {
  const errors = json?.errors;
  if (!errors || typeof errors !== 'object') return null;
  for (const messages of Object.values(errors)) {
    if (Array.isArray(messages) && messages[0]) return messages[0];
    if (typeof messages === 'string' && messages) return messages;
  }
  return null;
}

function friendlyErrorMessage(status, json) {
  if (status === 413) {
    return 'File or request too large for the server. Try a smaller file, or paste a YouTube/video URL instead.';
  }
  if (status === 419) {
    return 'Your session expired. Please try again — if it keeps failing, refresh the page.';
  }
  if (status === 401) {
    return 'You are logged out. Please log in again.';
  }
  if (status === 403) {
    return json?.message || 'You do not have permission for this action. Log out and sign in again as admin.';
  }
  if (status === 422) {
    const fieldError = firstValidationError(json);
    if (fieldError) {
      if (/failed to upload|upload_max_filesize|post_max_size|exceeds server/i.test(fieldError)) {
        return `${fieldError} You can also paste a YouTube link instead of uploading.`;
      }
      return fieldError;
    }
  }
  return json?.message || `HTTP ${status}`;
}

export async function apiFetch(path, { method = 'GET', body, headers = {} } = {}, _retried = false) {
  const isMutation = method !== 'GET' && method !== 'HEAD';
  if (isMutation) {
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

  // Session/CSRF token expired mid-session — refresh the cookie and retry once.
  // (FormData bodies cannot be resent after a failed attempt in some browsers,
  // but a fresh attempt with the same FormData object works for fetch.)
  if (res.status === 419 && !_retried) {
    csrfReady = false;
    await ensureCsrf();
    return apiFetch(path, { method, body, headers }, true);
  }

  let json = null;
  const text = await res.text();
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { message: text };
  }

  if (!res.ok) {
    const err = new Error(friendlyErrorMessage(res.status, json));
    err.status = res.status;
    err.data = json;
    throw err;
  }

  if (isMutation && typeof window !== 'undefined' && !url.includes('/auth/')) {
    window.dispatchEvent(new CustomEvent(ADMIN_SAVED_EVENT, { detail: { url, method } }));
  }

  return json;
}

export default apiFetch;
