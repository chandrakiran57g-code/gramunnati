/**
 * Admin-entered URL helpers.
 * Admins paste links in many formats ("facebook.com/cmsr", "www.youtube.com/@cmsr",
 * "https://x.com/cmsr") — normalize them so every link opens the real page instead
 * of being treated as an internal route.
 */

/** Returns a safe, absolute href for an admin-entered URL. Internal paths ("/donate") pass through. */
export function normalizeExternalUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(raw)) return raw;
  if (raw.startsWith('/') || raw.startsWith('#')) return raw;
  // Bare domain like "facebook.com/cmsr" or "www.instagram.com/cmsr" → make absolute
  if (/^[\w-]+(\.[\w-]+)+(\/|$|\?)/.test(raw)) return `https://${raw}`;
  return raw;
}

/** True when the (normalized) URL should open in a new tab instead of client-side routing. */
export function isExternalUrl(url) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(normalizeExternalUrl(url));
}
