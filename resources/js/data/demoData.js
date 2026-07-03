import { VILLAGE_HERO_PHOTOS, buildHeroSlides } from '@/lib/villageImages';

function img(index, w = 600) {
  return VILLAGE_HERO_PHOTOS[index % VILLAGE_HERO_PHOTOS.length].url.replace('w=1920', `w=${w}`);
}

export const DEMO_STATS = {
  villages: 248,
  schools: 512,
  projects: 86,
  donations: 1240,
  totalAmount: 4850000,
  volunteers: 320,
  beneficiaries: 18500,
};

export const DEMO_VILLAGES = [
  {
    id: 'demo-v-kondapur',
    slug: 'kondapur',
    village_name: 'Kondapur',
    state: 'Telangana',
    district: 'Medak',
    mandal: 'Sangareddy',
    short_description: 'Digital classroom aur paani supply project — gaon tez badh raha hai.',
    cover_image: img(0),
    is_featured: true,
    is_active: true,
    schools_count: 3,
    projects_count: 5,
    volunteers_count: 24,
  },
  {
    id: 'demo-v-rajapet',
    slug: 'rajapet',
    village_name: 'Rajapet',
    state: 'Telangana',
    district: 'Warangal',
    mandal: 'Wardhannapet',
    short_description: 'Mahila SHG aur tree plantation — hariyali wapas aa rahi hai.',
    cover_image: img(6),
    is_featured: true,
    is_active: true,
    schools_count: 2,
    projects_count: 4,
    volunteers_count: 18,
  },
  {
    id: 'demo-v-rampur',
    slug: 'rampur',
    village_name: 'Rampur',
    state: 'Telangana',
    district: 'Nalgonda',
    mandal: 'Nakrekal',
    short_description: 'Pehla computer lab — bachche digital duniya se jud rahe hain.',
    cover_image: img(4),
    is_featured: true,
    is_active: true,
    schools_count: 2,
    projects_count: 3,
    volunteers_count: 15,
  },
];

export const DEMO_SCHOOLS = [
  {
    id: 'demo-s-kondapur',
    slug: 'zphs-kondapur',
    school_name: 'ZPHS Kondapur',
    school_type: 'government',
    village_name: 'Kondapur',
    state: 'Telangana',
    district: 'Medak',
    short_description: '320 students — ab digital smart classroom bhi hai.',
    cover_image: img(1),
    is_featured: true,
    is_active: true,
    student_count: 320,
    teacher_count: 12,
  },
  {
    id: 'demo-s-nalgonda',
    slug: 'govt-high-nalgonda',
    school_name: 'Govt. High School Nalgonda',
    school_type: 'government',
    village_name: 'Nalgonda',
    state: 'Telangana',
    district: 'Nalgonda',
    short_description: 'Check dam project se paani mila — attendance badhi.',
    cover_image: img(2),
    is_featured: true,
    is_active: true,
    student_count: 280,
    teacher_count: 10,
  },
  {
    id: 'demo-s-rampur',
    slug: 'model-primary-rampur',
    school_name: 'Model Primary School Rampur',
    school_type: 'model',
    village_name: 'Rampur',
    state: 'Telangana',
    district: 'Nalgonda',
    short_description: 'Pehla computer lab — 200 bachche computers seekh rahe hain.',
    cover_image: img(3),
    is_featured: true,
    is_active: true,
    student_count: 200,
    teacher_count: 8,
  },
];

export const DEMO_PROJECTS = [
  {
    id: 'demo-p-water',
    slug: 'water-harvest-kondapur',
    project_name: 'Water Harvest — Kondapur',
    category: 'Water Conservation',
    village_name: 'Kondapur',
    state: 'Telangana',
    district: 'Medak',
    short_description: 'Check dam se 85 parivar ka kharif bach gaya.',
    cover_image: img(5),
    status: 'active',
    is_featured: true,
    budget_amount: 500000,
    raised_amount: 320000,
    progress_percentage: 64,
    villages: { village_name: 'Kondapur', slug: 'kondapur' },
  },
  {
    id: 'demo-p-school',
    slug: 'digital-classroom-kondapur',
    project_name: 'Digital Classroom — Kondapur',
    category: 'School Development',
    village_name: 'Kondapur',
    state: 'Telangana',
    district: 'Medak',
    short_description: 'Smart board, tablets aur internet — poora classroom digital.',
    cover_image: img(1),
    status: 'active',
    is_featured: true,
    budget_amount: 350000,
    raised_amount: 210000,
    progress_percentage: 60,
    villages: { village_name: 'Kondapur', slug: 'kondapur' },
  },
  {
    id: 'demo-p-trees',
    slug: 'green-drive-chittoor',
    project_name: 'Green Drive — Chittoor Belt',
    category: 'Tree Plantation',
    village_name: 'Rajapet',
    state: 'Telangana',
    district: 'Warangal',
    short_description: '5,000 ped ek din mein — 12 gaon ne milkar lagaye.',
    cover_image: img(6),
    status: 'active',
    is_featured: true,
    budget_amount: 200000,
    raised_amount: 145000,
    progress_percentage: 72,
    villages: { village_name: 'Rajapet', slug: 'rajapet' },
  },
];

export const DEMO_URGENT_PROJECTS = DEMO_PROJECTS.map((p) => {
  const target = p.budget_amount;
  const raised = p.raised_amount;
  const progress = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  return { ...p, target, raised, progress };
}).concat([
  {
    id: 'demo-p-computer',
    slug: 'computer-lab-rampur',
    project_name: 'Computer Lab — Rampur School',
    category: 'School Development',
    cover_image: img(3),
    status: 'active',
    budget_amount: 180000,
    raised_amount: 45000,
    raised: 45000,
    target: 180000,
    progress: 25,
    villages: { village_name: 'Rampur', slug: 'rampur' },
  },
]);

export const DEMO_HERO_PHOTOS = buildHeroSlides([]);

export const DEMO_ACTIVITY = [
  { id: 'demo-a1', text: '₹5,000 donated to Kondapur Water Project', time: '12 min ago', icon: '💛' },
  { id: 'demo-a2', text: 'New volunteer joined from Hyderabad', time: '28 min ago', icon: '🌱' },
  { id: 'demo-a3', text: 'Tree plantation drive completed in Rajapet', time: '1 hr ago', icon: '🌳' },
  { id: 'demo-a4', text: '₹2,500 donated to ZPHS Kondapur', time: '2 hr ago', icon: '💛' },
  { id: 'demo-a5', text: 'Digital classroom equipment delivered', time: '3 hr ago', icon: '🏫' },
];

export const DEMO_PAGE_DATA = {
  stats: DEMO_STATS,
  villages: DEMO_VILLAGES,
  schools: DEMO_SCHOOLS,
  projects: DEMO_PROJECTS,
  programs: [],
  stories: [],
  testimonials: [],
  news: [],
  events: [],
  activity: DEMO_ACTIVITY,
  heroPhotos: DEMO_HERO_PHOTOS,
  monthlyDonations: 185000,
  donationBreakdown: [
    { name: 'Village', value: 42, color: '#8B6914' },
    { name: 'School', value: 35, color: '#6B5344' },
    { name: 'Project', value: 18, color: '#5C4033' },
    { name: 'General', value: 5, color: '#D4A017' },
  ],
  stateStats: [
    { state: 'Telangana', villages: 68, schools: 142, projects: 28 },
    { state: 'Andhra Pradesh', villages: 54, schools: 98, projects: 19 },
    { state: 'Karnataka', villages: 41, schools: 76, projects: 14 },
  ],
  partners: [],
  gallery: [],
  urgentProjects: DEMO_URGENT_PROJECTS,
};

export function useDemoData() {
  return import.meta.env.VITE_USE_DEMO_DATA === 'true';
}

function hasStats(dbStats) {
  if (!dbStats) return false;
  return dbStats.villages > 0 || dbStats.schools > 0 || dbStats.totalAmount > 0;
}

/** Fill empty DB list sections with demo content only when VITE_USE_DEMO_DATA=true */
export function mergeHomePageWithDemo(db) {
  if (useDemoData()) return { ...DEMO_PAGE_DATA };

  return {
    stats: db.stats || {
      villages: 0,
      schools: 0,
      projects: 0,
      donations: 0,
      totalAmount: 0,
      volunteers: 0,
      beneficiaries: 0,
    },
    villages: db.villages?.length ? db.villages : [],
    schools: db.schools?.length ? db.schools : [],
    projects: db.projects?.length ? db.projects : [],
    programs: db.programs?.length ? db.programs : [],
    stories: db.stories?.length ? db.stories : [],
    testimonials: db.testimonials?.length ? db.testimonials : [],
    news: db.news?.length ? db.news : [],
    events: db.events?.length ? db.events : [],
    activity: db.activity?.length ? db.activity : [],
    heroPhotos: db.heroPhotos?.length >= 2 ? db.heroPhotos : [],
    monthlyDonations: db.monthlyDonations || 0,
    donationBreakdown: db.donationBreakdown?.some((d) => d.value > 0)
      ? db.donationBreakdown
      : [],
    stateStats: db.stateStats?.length ? db.stateStats : [],
    partners: db.partners?.length ? db.partners : [],
    gallery: db.gallery?.length ? db.gallery : [],
    urgentProjects: db.urgentProjects?.length ? db.urgentProjects : [],
  };
}

export function getDemoPageData() {
  return { ...DEMO_PAGE_DATA };
}
