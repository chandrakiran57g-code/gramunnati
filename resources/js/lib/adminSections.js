/**
 * Admin section → public navbar placement + default URL base.
 * Adding content under a section controls where it appears on the site.
 */
export const ADMIN_SECTIONS = {
  about_us: {
    key: 'about_us',
    label: 'About Us',
    description: 'Appears in the About Us dropdown on the public navbar.',
    publicBase: '/page',
    navGroup: 'about_us',
  },
  teams: {
    key: 'teams',
    label: 'Teams',
    description: 'Team members shown under Teams on the public site.',
    publicBase: '/teams',
  },
  programs: {
    key: 'programs',
    label: 'What We Do',
    description: 'Programs listed under What We Do in the navbar.',
    publicBase: '/programs',
  },
  members: {
    key: 'members',
    label: 'Member List',
    description: 'Registered members — auto-listed by join order at /members.',
    publicBase: '/members',
    readOnly: true,
  },
  partners: {
    key: 'partners',
    label: 'Partner Organisations',
    description: 'Logo grid on the Partners page; each links to its website.',
    publicBase: '/partners',
  },
  gallery: {
    key: 'gallery',
    label: 'Gallery',
    description: 'Photo and video collections on /gallery.',
    publicBase: '/gallery',
  },
  active_works: {
    key: 'active_works',
    label: 'Active Works',
    description: 'Homepage cards linking to detailed village/school-style pages.',
    publicBase: '/active-work',
  },
};

export const VOLUNTEER_SKILLS = [
  'Teaching', 'Agriculture', 'Engineering', 'Healthcare', 'IT', 'Environment',
  'Construction', 'Social Work', 'Legal', 'Finance', 'Marketing', 'Photography',
];

export const VOLUNTEER_STATES = [
  'Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Gujarat',
  'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'West Bengal', 'Bihar', 'Odisha',
  'Kerala', 'Punjab', 'Haryana', 'Delhi', 'Other',
];

export const VOLUNTEER_AVAILABILITY = [
  { value: 'flexible', label: 'Flexible' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'both', label: 'Both' },
];

export const VOLUNTEER_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-600' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
];
