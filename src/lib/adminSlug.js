/** Auto-generate URL slug from title; used across admin create forms. */
export function slugifyTitle(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function buildPublicPath(basePath, slug) {
  const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const clean = slugifyTitle(slug);
  return clean ? `${base}/${clean}` : base;
}
