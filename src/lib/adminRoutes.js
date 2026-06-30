/** Central admin route paths — use these instead of hardcoding `/admin` URLs. */
export const ADMIN_BASE = '/admin';

export const adminRoutes = {
  login: `${ADMIN_BASE}/login`,
  dashboard: ADMIN_BASE,

  /* Navbar Manager */
  aboutUs: `${ADMIN_BASE}/nav/about-us`,
  teams: `${ADMIN_BASE}/nav/teams`,
  memberDirectory: `${ADMIN_BASE}/nav/member-list`,
  programs: `${ADMIN_BASE}/nav/programs`,
  partners: `${ADMIN_BASE}/nav/partners`,
  gallery: `${ADMIN_BASE}/nav/gallery`,

  /* Active Works */
  activeWorks: `${ADMIN_BASE}/active-works`,
  activeWorksCards: `${ADMIN_BASE}/active-works/cards`,
  activeWorksPages: `${ADMIN_BASE}/active-works/pages`,
  activeWorksTemplates: `${ADMIN_BASE}/active-works/templates`,
  needSupport: `${ADMIN_BASE}/need-support`,

  /* Donations */
  donations: `${ADMIN_BASE}/donations`,
  receipts: `${ADMIN_BASE}/receipts`,

  /* Communication & people */
  messages: `${ADMIN_BASE}/communication`,
  volunteers: `${ADMIN_BASE}/volunteers`,

  /* Content */
  stories: `${ADMIN_BASE}/stories`,
  news: `${ADMIN_BASE}/news`,

  reports: `${ADMIN_BASE}/reports`,
  settings: `${ADMIN_BASE}/settings`,

  /* Legacy aliases — redirect in router */
  navigation: `${ADMIN_BASE}/navigation`,
  pages: `${ADMIN_BASE}/pages`,
  homepage: `${ADMIN_BASE}/homepage`,
  users: `${ADMIN_BASE}/users`,
  beneficiaries: `${ADMIN_BASE}/beneficiaries`,
  events: `${ADMIN_BASE}/events`,
  notifications: `${ADMIN_BASE}/notifications`,
  cms: `${ADMIN_BASE}/cms`,
  roles: `${ADMIN_BASE}/roles`,
  auditLogs: `${ADMIN_BASE}/audit-logs`,
  backup: `${ADMIN_BASE}/backup`,
  villages: `${ADMIN_BASE}/villages`,
  villageActivities: `${ADMIN_BASE}/village-activities`,
  villageDonations: `${ADMIN_BASE}/village-donations`,
  schools: `${ADMIN_BASE}/schools`,
  schoolActivities: `${ADMIN_BASE}/school-activities`,
  schoolDonations: `${ADMIN_BASE}/school-donations`,
  projects: `${ADMIN_BASE}/projects`,
  projectCategories: `${ADMIN_BASE}/project-categories`,
  impactMetrics: `${ADMIN_BASE}/impact-metrics`,
};
