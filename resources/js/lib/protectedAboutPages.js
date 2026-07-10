/**
 * Built-in About Us pages that always exist and cannot be deleted.
 * Each renders admin-editable content on top plus a live directory list
 * (villages / schools / volunteers) — see lib/serviceDirectory.js.
 */

/** Fixed public page — not editable or deletable from admin. */
export const SYSTEM_ABOUT_CMSR = {
  slug: 'about-cmsr',
  title: 'About CMSR',
  path: '/about',
};

export const LOCKED_CMS_SLUGS = [SYSTEM_ABOUT_CMSR.slug];

export function isLockedCmsSlug(slug) {
  return LOCKED_CMS_SLUGS.includes(slug);
}

export const PROTECTED_ABOUT_PAGES = [
  {
    slug: 'about-villages',
    title: 'About Villages',
    short_description: 'Understanding the village development program.',
    content: 'The village module allows communities to create digital profiles, track development needs, and receive donations.',
    display_order: 4,
  },
  {
    slug: 'about-schools',
    title: 'About Schools',
    short_description: 'How we empower rural schools.',
    content: 'Our school empowerment program focuses on infrastructure, digital classrooms, and connecting schools with donors.',
    display_order: 5,
  },
  {
    slug: 'about-volunteers',
    title: 'About Volunteers',
    short_description: 'Join our volunteer network.',
    content: 'Volunteers are the backbone of CMSR. Register on the Volunteer page to be matched with relevant projects.',
    display_order: 6,
  },
];

export const PROTECTED_ABOUT_SLUGS = PROTECTED_ABOUT_PAGES.map((p) => p.slug);

export function isProtectedAboutSlug(slug) {
  return PROTECTED_ABOUT_SLUGS.includes(slug);
}
