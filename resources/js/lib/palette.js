/**
 * GramUnnati — Finalized Color Palette
 * Base: cream + brown | Accents: 8 service pillars only
 */

export const cream = {
  50: '#f9f9f7',
  100: '#f4f3ef',
  200: '#efeee8',
  300: '#eae8e0',
  400: '#e5e3d9',
};

export const brown = {
  900: '#2C2418', // Deep Brown — primary text, navbar, footer
  800: '#3D2914', // Espresso — hover on dark surfaces
  600: '#5C4033', // Coffee Brown — primary buttons
  500: '#6B5344', // Warm Stone — secondary text
  400: '#9C8B7A', // Clay Gray — muted labels
  300: '#D4B896', // Sand Clay — borders, dividers
  200: '#E7D9C4', // Light Clay — subtle borders
};

export const services = {
  village: {
    id: 'village',
    label: 'Village Development',
    color: '#2D6A4F',
    tint: '#E8F5EE',
    tailwind: { bg: 'bg-service-village', text: 'text-service-village', light: 'bg-service-village-tint' },
  },
  school: {
    id: 'school',
    label: 'School Development',
    color: '#2563EB',
    tint: '#EFF6FF',
    tailwind: { bg: 'bg-service-school', text: 'text-service-school', light: 'bg-service-school-tint' },
  },
  tree: {
    id: 'tree',
    label: 'Tree Plantation',
    color: '#16A34A',
    tint: '#ECFDF5',
    tailwind: { bg: 'bg-service-tree', text: 'text-service-tree', light: 'bg-service-tree-tint' },
  },
  water: {
    id: 'water',
    label: 'Water Conservation',
    color: '#0891B2',
    tint: '#ECFEFF',
    tailwind: { bg: 'bg-service-water', text: 'text-service-water', light: 'bg-service-water-tint' },
  },
  agriculture: {
    id: 'agriculture',
    label: 'Agriculture Development',
    color: '#CA8A04',
    tint: '#FEFCE8',
    tailwind: { bg: 'bg-service-agriculture', text: 'text-service-agriculture', light: 'bg-service-agriculture-tint' },
  },
  women: {
    id: 'women',
    label: 'Women Self-Help Groups',
    color: '#DB2777',
    tint: '#FDF2F8',
    tailwind: { bg: 'bg-service-women', text: 'text-service-women', light: 'bg-service-women-tint' },
  },
  skill: {
    id: 'skill',
    label: 'Skill Development',
    color: '#9333EA',
    tint: '#FAF5FF',
    tailwind: { bg: 'bg-service-skill', text: 'text-service-skill', light: 'bg-service-skill-tint' },
  },
  healthcare: {
    id: 'healthcare',
    label: 'Healthcare',
    color: '#DC2626',
    tint: '#FEF2F2',
    tailwind: { bg: 'bg-service-healthcare', text: 'text-service-healthcare', light: 'bg-service-healthcare-tint' },
  },
};

/** Map project/program category strings → service key */
export const categoryToService = {
  'Village Development': 'village',
  'School Development': 'school',
  'School Empowerment': 'school',
  'Tree Plantation': 'tree',
  'Water Conservation': 'water',
  Agriculture: 'agriculture',
  'Women SHG': 'women',
  'Women Self-Help Groups': 'women',
  'Women SHGs': 'women',
  'Skill Development': 'skill',
  Healthcare: 'healthcare',
};

export function getServiceColors(category) {
  const key = categoryToService[category];
  return key ? services[key] : null;
}

export const palette = { cream, brown, services };
