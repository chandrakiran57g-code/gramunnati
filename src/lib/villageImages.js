/** Curated village / school / fields photos only — no random external URLs on home */

function u(id, w = 1920) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
}

export const VILLAGE_HERO_PHOTOS = [
  {
    url: u('1500382017468-9049fed747ef'),
    alt: 'Golden wheat fields in rural India',
    caption: 'Khet aur khalihan — zameen se juda har gaon',
    category: 'fields',
  },
  {
    url: u('1765994898026-4fa84ade4a61'),
    alt: 'Rural school building with children in courtyard',
    caption: 'Gaon ka school — bachche khelte hue',
    category: 'school',
  },
  {
    url: u('1760821668304-4ec106518e30'),
    alt: 'Village children in school uniforms outdoors',
    caption: 'School uniform mein gaon ke bachche',
    category: 'school',
  },
  {
    url: u('1580582932707-520aed937b7b'),
    alt: 'Village school classroom with students',
    caption: 'Classroom mein padhai — gaon ki school',
    category: 'school',
  },
  {
    url: u('1759143101324-d375443f1955'),
    alt: 'Children studying in rural classroom',
    caption: 'Padhai ka waqt — har bachche ka haq',
    category: 'school',
  },
  {
    url: u('1523348837708-15d4a09cfac2'),
    alt: 'Farmers working in village fields',
    caption: 'Kisan aur mitti — gaon ki pehchaan',
    category: 'fields',
  },
  {
    url: u('1542601906990-b4d3fb778b09'),
    alt: 'Tree plantation in rural village',
    caption: 'Ped lagao — hariyali wapas lao',
    category: 'village',
  },
];

const APPROVED_UNSPLASH_IDS = new Set(
  VILLAGE_HERO_PHOTOS.map((p) => p.url.match(/photo-([^?]+)/)?.[1]).filter(Boolean),
);

const BLOCKED_URL_PATTERN = /cake|birthday|food|dessert|wedding|party|restaurant|coffee|pizza|burger|pastry|bakery|cupcake|sweets|candy/i;

const TRUSTED_UPLOAD_HOSTS = ['supabase.co', 'gramunnati.in'];

export const VILLAGE_SIDE_PHOTOS = VILLAGE_HERO_PHOTOS.slice(0, 4).map((p, i) => ({
  src: p.url.replace('w=1920', 'w=600'),
  alt: p.alt,
  label: ['Mitti ke khet', 'Gaon ki school', 'School ke bachche', 'Gaon ki padhai'][i],
}));

export const CATEGORY_LABELS = {
  village: 'Gaon',
  school: 'Village School',
  fields: 'Khet & Khalihan',
};

export function isUsableImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return false;
  if (trimmed.startsWith('/')) return true;
  return /^https?:\/\/.+/i.test(trimmed);
}

/** Only village-relevant images: curated list, your uploads, or local files */
export function isApprovedVillageImage(url) {
  if (!isUsableImageUrl(url)) return false;
  const trimmed = url.trim();
  if (BLOCKED_URL_PATTERN.test(trimmed)) return false;
  if (trimmed.startsWith('/')) return true;
  if (TRUSTED_UPLOAD_HOSTS.some((host) => trimmed.includes(host))) return true;
  const match = trimmed.match(/photo-([\w-]+)/);
  if (match && APPROVED_UNSPLASH_IDS.has(match[1])) return true;
  return false;
}

export function resolveImageUrl(url, fallbackIndex = 0, width = 1920) {
  if (isApprovedVillageImage(url)) return url.trim();
  const photo = VILLAGE_HERO_PHOTOS[fallbackIndex % VILLAGE_HERO_PHOTOS.length];
  return photo.url.replace('w=1920', `w=${width}`);
}

export function buildHeroSlides(photos) {
  const fromDb = (photos || [])
    .filter((p) => isApprovedVillageImage(p?.url))
    .map((p) => ({
      url: p.url.trim(),
      alt: p.alt || 'Village photo',
      caption: p.caption || 'Hamara gaon',
      category: p.category || 'village',
    }));

  const seen = new Set(fromDb.map((p) => p.url));
  const merged = [...fromDb];

  for (const fallback of VILLAGE_HERO_PHOTOS) {
    if (merged.length >= 8) break;
    if (!seen.has(fallback.url)) {
      merged.push(fallback);
      seen.add(fallback.url);
    }
  }

  return merged.length > 0 ? merged : VILLAGE_HERO_PHOTOS;
}
