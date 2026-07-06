/**
 * Before/After CMSR gallery helpers.
 * Detail page galleries are stored as { before: [urls], after: [urls] }.
 * Village/school entities persist rows in the `galleries` table tagged by title.
 */

export const BEFORE_CMSR_TITLE = 'before-cmsr';
export const AFTER_CMSR_TITLE = 'after-cmsr';

/** Accepts the stored gallery value in any historical shape and returns { before, after } url arrays. */
export function normalizeBeforeAfter(gallery) {
  if (!gallery) return { before: [], after: [] };
  if (Array.isArray(gallery)) {
    // Legacy shape: [{ image, caption }] — show as "After CMSR"
    return {
      before: [],
      after: gallery.map((g) => (typeof g === 'string' ? g : g?.image)).filter(Boolean),
    };
  }
  return {
    before: Array.isArray(gallery.before) ? gallery.before.filter(Boolean) : [],
    after: Array.isArray(gallery.after) ? gallery.after.filter(Boolean) : [],
  };
}

/** Groups `galleries` table rows into { before, after, other } image url arrays. */
export function groupGalleryRows(rows) {
  const grouped = { before: [], after: [], other: [] };
  (rows || []).forEach((row) => {
    if (!row?.image_path) return;
    if (row.title === BEFORE_CMSR_TITLE) grouped.before.push(row.image_path);
    else if (row.title === AFTER_CMSR_TITLE) grouped.after.push(row.image_path);
    else grouped.other.push(row.image_path);
  });
  return grouped;
}

export function hasBeforeAfterImages(gallery) {
  const g = normalizeBeforeAfter(gallery);
  return g.before.length > 0 || g.after.length > 0;
}
