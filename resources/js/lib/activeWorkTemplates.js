/** Active Works — Village, School & Program detail page templates */

import { PROGRAMS, getProgramBySlug } from '@/lib/programs';

export const PROGRAM_CATEGORY_OPTIONS = PROGRAMS.map((p) => ({
  id: p.slug,
  slug: p.slug,
  label: p.title,
  icon: p.icon,
}));

export const ACTIVE_WORK_TEMPLATE_TYPES = [
  { id: 'village', label: 'Village', icon: '🏘️', group: 'entity', builtIn: true },
  { id: 'school', label: 'School', icon: '🏫', group: 'entity', builtIn: true },
  ...PROGRAM_CATEGORY_OPTIONS.map((p) => ({ id: p.id, label: p.label, icon: p.icon, group: 'program' })),
];

/** Built-in entity templates — always listed in Templates admin */
export const BUILT_IN_ENTITY_TEMPLATES = [
  { id: 'village', slug: 'village', name: 'Village', icon: '🏘️', builtIn: true },
  { id: 'school', slug: 'school', name: 'School', icon: '🏫', builtIn: true },
];

/** Cards / Pages template dropdown — mirrors Templates admin (built-in + custom only) */
export function buildEntityTemplateOptions(entityTemplates = []) {
  const builtIn = BUILT_IN_ENTITY_TEMPLATES.map((t) => ({
    id: t.slug,
    label: t.name,
    icon: t.icon,
    builtIn: true,
  }));
  const custom = (entityTemplates || [])
    .filter((t) => t.status === 'active')
    .map((t) => ({
      id: t.slug,
      label: t.name,
      icon: t.icon || '📋',
      custom: true,
    }));
  return [...builtIn, ...custom];
}

/** Built-in + custom entities + programs (legacy / detail pages) */
export function buildActiveWorkTemplateTypes(entityTemplates = []) {
  return [
    ...buildEntityTemplateOptions(entityTemplates),
    ...ACTIVE_WORK_TEMPLATE_TYPES.filter((t) => t.group === 'program'),
  ];
}

export function formatActiveCategoryName(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return 'Active';
  if (/^active\s/i.test(trimmed)) return trimmed;
  return `Active ${trimmed}`;
}

export function isCustomEntityCategory(category) {
  return category?.entity_type === 'custom';
}

export function isProgramTemplate(templateType) {
  return PROGRAMS.some((p) => p.slug === templateType);
}

export function getProgramTemplateMeta(templateType) {
  return getProgramBySlug(templateType) || null;
}

export function getImpactFieldsForTemplate(templateType) {
  if (templateType === 'school') return SCHOOL_IMPACT_FIELDS;
  if (isProgramTemplate(templateType)) return PROGRAM_IMPACT_FIELDS;
  return VILLAGE_IMPACT_FIELDS;
}

export function getStatFieldsForTemplate(templateType) {
  if (templateType === 'school') return SCHOOL_STAT_FIELDS;
  if (isProgramTemplate(templateType)) return PROGRAM_STAT_FIELDS;
  return VILLAGE_STAT_FIELDS;
}

export function emptyActiveWorkCard() {
  return {
    title: '',
    slug: '',
    image: '',
    description: '',
    template_type: 'village',
    status: 'active',
    display_order: 0,
    page_id: null,
  };
}

export function emptyActiveWorkPage(templateType = 'village') {
  const base = {
    card_id: '',
    slug: '',
    template_type: templateType,
    program_slug: isProgramTemplate(templateType) ? templateType : '',
    program_icon: getProgramTemplateMeta(templateType)?.icon || '',
    name: '',
    cover_image: '',
    description: '',
    location: { district: '', state: '', pincode: '' },
    overview: { about: '', vision: '', challenges: '', achievements: '' },
    development_score: {
      education: 0,
      infrastructure: 0,
      environment: 0,
      agriculture: 0,
      community: 0,
    },
    statistics: {},
    program_details: { objectives: '', activities: '', impact_highlights: '' },
    timeline: [],
    gallery: [],
    donations: { goal: 0, raised: 0 },
    card: { enable_donate: true, enable_details: true, enable_follow: true, enable_compare: false },
    status: 'active',
    featured: true,
    display_order: 0,
  };

  if (isProgramTemplate(templateType)) {
    const prog = getProgramTemplateMeta(templateType);
    return {
      ...base,
      description: prog?.description || '',
      overview: {
        about: prog?.longDescription || prog?.description || '',
        vision: '',
        challenges: '',
        achievements: '',
      },
      impact: {
        beneficiaries: 0,
        villages_reached: prog?.stats?.villages || 0,
        schools_reached: prog?.stats?.schools || 0,
        volunteers: prog?.stats?.volunteers || 0,
        funds_raised: prog?.stats?.donations || 0,
        projects_count: 0,
      },
      statistics: {
        villages: prog?.stats?.villages ?? '',
        schools: prog?.stats?.schools ?? '',
        volunteers: prog?.stats?.volunteers ?? '',
        donations: prog?.stats?.donations ?? '',
      },
      program_details: {
        objectives: (prog?.objectives || []).join('\n'),
        activities: (prog?.activities || []).join('\n'),
        impact_highlights: (prog?.impact || []).join('\n'),
      },
    };
  }

  if (templateType === 'village') {
    return {
      ...base,
      impact: {
        trees_planted: 0,
        water_bodies: 0,
        farmer_count: 0,
        schools_count: 0,
        projects_count: 0,
        volunteers_count: 0,
      },
      statistics: {
        population: '',
        male_population: '',
        female_population: '',
        literacy_rate: '',
        cultivable_land: '',
      },
    };
  }

  return {
    ...base,
    impact: {
      students_count: 0,
      teachers_count: 0,
      classrooms: 0,
      labs: 0,
      projects_count: 0,
      volunteers_count: 0,
    },
    statistics: {
      udise_code: '',
      established_year: '',
      student_teacher_ratio: '',
      pass_percentage: '',
      infrastructure_score: '',
    },
  };
}

export const VILLAGE_IMPACT_FIELDS = [
  { key: 'trees_planted', label: 'Trees Planted', type: 'number' },
  { key: 'water_bodies', label: 'Water Bodies', type: 'number' },
  { key: 'farmer_count', label: 'Farmer Count', type: 'number' },
  { key: 'schools_count', label: 'Schools', type: 'number' },
  { key: 'projects_count', label: 'Projects', type: 'number' },
  { key: 'volunteers_count', label: 'Volunteers', type: 'number' },
];

export const SCHOOL_IMPACT_FIELDS = [
  { key: 'students_count', label: 'Students', type: 'number' },
  { key: 'teachers_count', label: 'Teachers', type: 'number' },
  { key: 'classrooms', label: 'Classrooms', type: 'number' },
  { key: 'labs', label: 'Labs', type: 'number' },
  { key: 'projects_count', label: 'Projects', type: 'number' },
  { key: 'volunteers_count', label: 'Volunteers', type: 'number' },
];

export const PROGRAM_IMPACT_FIELDS = [
  { key: 'beneficiaries', label: 'Beneficiaries', type: 'number' },
  { key: 'villages_reached', label: 'Villages Reached', type: 'number' },
  { key: 'schools_reached', label: 'Schools Reached', type: 'number' },
  { key: 'volunteers', label: 'Volunteers', type: 'number' },
  { key: 'funds_raised', label: 'Funds Raised (₹)', type: 'number' },
  { key: 'projects_count', label: 'Projects', type: 'number' },
];

export const DEVELOPMENT_SCORE_FIELDS = [
  { key: 'education', label: 'Education' },
  { key: 'infrastructure', label: 'Infrastructure' },
  { key: 'environment', label: 'Environment' },
  { key: 'agriculture', label: 'Agriculture' },
  { key: 'community', label: 'Community' },
];

export const VILLAGE_STAT_FIELDS = [
  { key: 'population', label: 'Population' },
  { key: 'male_population', label: 'Male Population' },
  { key: 'female_population', label: 'Female Population' },
  { key: 'literacy_rate', label: 'Literacy Rate (%)' },
  { key: 'cultivable_land', label: 'Cultivable Land' },
];

export const SCHOOL_STAT_FIELDS = [
  { key: 'udise_code', label: 'UDISE Code' },
  { key: 'established_year', label: 'Established Year' },
  { key: 'student_teacher_ratio', label: 'Student–Teacher Ratio' },
  { key: 'pass_percentage', label: 'Pass Percentage' },
  { key: 'infrastructure_score', label: 'Infrastructure Score' },
];

export const PROGRAM_STAT_FIELDS = [
  { key: 'villages', label: 'Villages Covered' },
  { key: 'schools', label: 'Schools Covered' },
  { key: 'volunteers', label: 'Volunteers' },
  { key: 'donations', label: 'Total Donations (₹)' },
];

/** Active Works categories — one per program pillar */
export const PROGRAM_ACTIVE_CATEGORIES = PROGRAMS.map((p, i) => ({
  id: `cat-${p.slug}`,
  name: p.title,
  slug: `active-${p.slug}`,
  template_type: p.slug,
  program_slug: p.slug,
  view_all_link: `/active-works/category/active-${p.slug}`,
  display_order: 2 + i,
  status: 'active',
}));

export const DEFAULT_ACTIVE_CATEGORIES = [
  { id: 'cat-village', name: 'Village', slug: 'village', template_type: 'village', status: 'active', display_order: 0 },
  { id: 'cat-school', name: 'School', slug: 'school', template_type: 'school', status: 'active', display_order: 1 },
  ...PROGRAM_ACTIVE_CATEGORIES,
];
