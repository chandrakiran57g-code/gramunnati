import { getHomeBreadcrumbTarget } from '@/lib/homeSectionAnchors';

const PUBLIC_SEGMENT_LABELS = {
  about: 'About',
  vision: 'Vision',
  mission: 'Mission',
  objectives: 'Objectives',
  'our-team': 'Our Team',
  'advisory-board': 'Advisory Board',
  villages: 'Villages',
  schools: 'Schools',
  projects: 'Projects',
  programs: 'Programs',
  impact: 'Impact',
  gallery: 'Gallery',
  donate: 'Donate',
  volunteer: 'Volunteer',
  contact: 'Contact',
  stories: 'Stories',
  search: 'Search',
  news: 'News',
  events: 'Events',
  faqs: 'FAQs',
  compare: 'Compare',
  page: 'Pages',
  'active-works': 'Active Works',
  category: 'Category',
  'need-support': 'Need Support',
  'active-work': 'Active Work',
  teams: 'Teams',
  partners: 'Partners',
  beneficiaries: 'Beneficiaries',
  members: 'Members',
  dashboard: 'Dashboard',
  profile: 'Profile',
  edit: 'Edit',
  'my-donations': 'My Donations',
  'my-receipts': 'My Receipts',
  'my-villages': 'My Villages',
  'my-schools': 'My Schools',
  'volunteer-profile': 'Volunteer Profile',
  'my-activities': 'My Activities',
  notifications: 'Notifications',
  settings: 'Settings',
  login: 'Login',
  register: 'Register',
  'forgot-password': 'Forgot Password',
  'reset-password': 'Reset Password',
  'model-village': 'Model Village',
  'model-school': 'Model School',
};

const ADMIN_SEGMENT_LABELS = {
  admin: 'Admin',
  nav: 'Navbar',
  'about-us': 'About Us',
  teams: 'Teams',
  'member-list': 'Member List',
  programs: 'Programs',
  'program-pages': 'Program Pages',
  partners: 'Partners',
  gallery: 'Gallery',
  'active-works': 'Active Works',
  templates: 'Templates',
  cards: 'Cards',
  pages: 'Detail Pages',
  'need-support': 'Need Support',
  donations: 'Donations',
  receipts: 'Receipts',
  communication: 'Communication',
  volunteers: 'Volunteers',
  stories: 'Stories',
  news: 'News',
  faqs: 'FAQs',
  reports: 'Reports',
  settings: 'Settings',
  messages: 'Messages',
};

const DEFAULT_EXCLUDED = new Set(['/']);

export function shouldShowBreadcrumbs(pathname, excludedPaths = DEFAULT_EXCLUDED) {
  return !excludedPaths.has(pathname);
}

function humanizeSlug(value) {
  if (!value) return '';
  return value
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function isLikelySlug(segment, labels) {
  return !labels[segment] && !/^\d+$/.test(segment);
}

export function buildPublicBreadcrumbs(pathname, currentLabel) {
  if (pathname === '/') return [];

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'Home', to: getHomeBreadcrumbTarget(pathname), decorated: false }];
  let path = '';

  segments.forEach((segment, index) => {
    path += `/${segment}`;
    const isLast = index === segments.length - 1;
    const staticLabel = PUBLIC_SEGMENT_LABELS[segment];
    const prevSegment = index > 0 ? segments[index - 1] : null;
    const parentIsSection = prevSegment && PUBLIC_SEGMENT_LABELS[prevSegment];

    let label;
    if (isLast && currentLabel) {
      label = currentLabel;
    } else if (staticLabel) {
      label = staticLabel;
    } else if (parentIsSection || isLikelySlug(segment, PUBLIC_SEGMENT_LABELS)) {
      label = humanizeSlug(segment);
    } else {
      label = humanizeSlug(segment);
    }

    const decorated = Boolean(staticLabel);
    const to = isLast ? null : path;

    crumbs.push({ label, to, decorated });
  });

  return crumbs;
}

export function buildAdminBreadcrumbs(pathname, currentLabel) {
  if (pathname === '/admin' || pathname === '/admin/') {
    return [{ label: 'Admin', to: null, decorated: true }];
  }

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'Admin', to: '/admin', decorated: true }];
  let path = '';

  segments.slice(1).forEach((segment, index) => {
    path += `/${segment}`;
    const fullPath = `/admin${path}`;
    const isLast = index === segments.length - 2;
    const staticLabel = ADMIN_SEGMENT_LABELS[segment];

    let label;
    if (isLast && currentLabel) {
      label = currentLabel;
    } else if (staticLabel) {
      label = staticLabel;
    } else {
      label = humanizeSlug(segment);
    }

    crumbs.push({
      label,
      to: isLast ? null : fullPath,
      decorated: Boolean(staticLabel),
    });
  });

  return crumbs;
}
