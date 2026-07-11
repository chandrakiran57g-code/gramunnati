const HOME_ROUTE_ANCHORS = {
  villages: 'home-hero-villages',
  schools: 'home-hero-schools',
  donate: 'home-hero-donate',
  volunteer: 'home-hero-volunteer',
  projects: 'home-featured',
  programs: 'home-programs',
  'need-support': 'home-urgent',
  'active-work': 'home-active-works',
  'active-works': 'home-active-works',
  news: 'home-news-events',
  events: 'home-news-events',
  stories: 'home-cta',
  gallery: 'home-hero',
  impact: 'home-impact',
  about: 'home-hero',
  contact: 'home-cta',
  faqs: 'home-cta',
  compare: 'home-featured',
  teams: 'home-hero',
  partners: 'home-hero',
  beneficiaries: 'home-hero',
  members: 'home-hero',
};

const EXIT_KEY = 'cmsr_home_exit_anchor';

export function rememberHomeExitAnchor(anchorId) {
  if (!anchorId) return;
  try {
    sessionStorage.setItem(EXIT_KEY, anchorId);
  } catch {
    /* ignore */
  }
}

export function getRememberedHomeExitAnchor() {
  try {
    return sessionStorage.getItem(EXIT_KEY);
  } catch {
    return null;
  }
}

export function clearRememberedHomeExitAnchor() {
  try {
    sessionStorage.removeItem(EXIT_KEY);
  } catch {
    /* ignore */
  }
}

export function getHomeAnchorForPath(pathname) {
  const segment = pathname.split('/').filter(Boolean)[0];
  return HOME_ROUTE_ANCHORS[segment] || 'home-hero';
}

export function getHomeBreadcrumbTarget(pathname) {
  const remembered = getRememberedHomeExitAnchor();
  const mapped = getHomeAnchorForPath(pathname);
  const anchor = remembered || mapped;
  return `/#${anchor}`;
}

export function getHomeAnchorFromHash(hash = '') {
  if (!hash || hash === '#') return null;
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}
