/** Default website navbar structure — persisted in settings.nav_config */
export const DEFAULT_NAV_CONFIG = {
  items: [
    { key: 'about-us', label: 'About Us', type: 'dropdown', enabled: true, order: 0, source: 'cms', navGroup: 'about_us' },
    { key: 'teams', label: 'Teams', type: 'dropdown', enabled: true, order: 1, source: 'team_groups' },
    { key: 'what-we-do', label: 'What We Do', type: 'dropdown', enabled: true, order: 2, source: 'programs' },
    { key: 'member-list', label: 'Member List', type: 'link', enabled: true, order: 3, path: '/members' },
    { key: 'partners', label: 'Partner Organizations', type: 'link', enabled: true, order: 4, path: '/partners' },
    { key: 'gallery', label: 'Gallery', type: 'link', enabled: true, order: 5, path: '/gallery' },
    { key: 'contact', label: 'Contact Us', type: 'link', enabled: true, order: 6, path: '/contact' },
  ],
};

export const NAV_GROUP_OPTIONS = [
  { value: 'about_us', label: 'About Us dropdown' },
  { value: 'standalone', label: 'Standalone page (not in dropdown)' },
  { value: 'hidden', label: 'Hidden from navbar' },
];
