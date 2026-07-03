import { PROGRAMS } from '@/lib/programs';

export const LOGO_URL = 'https://media.base44.com/images/public/user_6a19a4df98ac03e9b75a9132/71b2ecb8f_Screenshot2026-06-10200544.png';

export const FALLBACK_ABOUT_KEYS = [
  { key: 'aboutCMSR', path: '/about' },
  { key: 'visionMission', path: '/vision' },
  { key: 'beneficiaries', path: '/beneficiaries' },
  { key: 'aboutVillages', path: '/villages' },
  { key: 'aboutSchools', path: '/schools' },
  { key: 'aboutVolunteers', path: '/volunteer' },
  { key: 'aboutDonations', path: '/donate' },
  { key: 'impactDashboard', path: '/impact' },
  { key: 'successStories', path: '/stories' },
  { key: 'faqs', path: '/faqs' },
];

export const FALLBACK_PROGRAM_ITEMS = PROGRAMS.map((p) => ({
  label: p.title,
  path: `/programs/${p.slug}`,
}));
