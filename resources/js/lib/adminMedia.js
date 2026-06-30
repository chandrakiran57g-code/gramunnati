/** Fallback cover when admin has not uploaded an image yet. */
export const DEFAULT_CARD_IMAGE =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80';

export function resolveCardCover(url) {
  const trimmed = String(url || '').trim();
  return trimmed || DEFAULT_CARD_IMAGE;
}
