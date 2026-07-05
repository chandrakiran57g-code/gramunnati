/** CMS service-directory page slugs → data source config */
export const SERVICE_DIRECTORY_PAGES = {
  'about-villages': {
    type: 'villages',
    title: 'About Villages',
    linkPattern: (row) => `/villages/${row.slug}`,
  },
  'about-schools': {
    type: 'schools',
    title: 'About Schools',
    linkPattern: (row) => `/schools/${row.slug}`,
  },
  'about-volunteers': {
    type: 'volunteers',
    title: 'About Volunteers',
  },
  'about-village-development': {
    type: 'projects',
    categoryMatch: ['village development', 'village-development'],
    linkPattern: (row) => `/donate?project_id=${row.id}`,
  },
  'about-school-empowerment': {
    type: 'projects',
    categoryMatch: ['school empowerment', 'school-empowerment'],
    linkPattern: (row) => `/donate?project_id=${row.id}`,
  },
  'about-tree-plantation': {
    type: 'projects',
    categoryMatch: ['tree plantation', 'tree-plantation'],
    linkPattern: (row) => `/donate?project_id=${row.id}`,
  },
  'about-water-conservation': {
    type: 'projects',
    categoryMatch: ['water conservation', 'water-conservation'],
    linkPattern: (row) => `/donate?project_id=${row.id}`,
  },
  'about-agriculture-development': {
    type: 'projects',
    categoryMatch: ['agriculture development', 'agriculture-development', 'agriculture'],
    linkPattern: (row) => `/donate?project_id=${row.id}`,
  },
  'about-women-shgs': {
    type: 'projects',
    categoryMatch: ['women shgs', 'women-shgs', 'women shg'],
    linkPattern: (row) => `/donate?project_id=${row.id}`,
  },
  'about-skill-development': {
    type: 'projects',
    categoryMatch: ['skill development', 'skill-development'],
    linkPattern: (row) => `/donate?project_id=${row.id}`,
  },
  'about-healthcare': {
    type: 'projects',
    categoryMatch: ['healthcare', 'health care'],
    linkPattern: (row) => `/donate?project_id=${row.id}`,
  },
};

export function isServiceDirectorySlug(slug) {
  return Boolean(SERVICE_DIRECTORY_PAGES[slug]);
}

export function getServiceDirectoryConfig(slug) {
  return SERVICE_DIRECTORY_PAGES[slug] || null;
}

/** Fallback sample rows when DB has no records yet */
export const SAMPLE_DIRECTORY_ROWS = {
  villages: [
    { id: 's1', name: 'Rampur', mandal: 'Shamirpet', district: 'Medchal-Malkajgiri', date_of_entry: '2026-01-15', slug: 'rampur' },
    { id: 's2', name: 'Lakshmipur', mandal: 'Rajendranagar', district: 'Rangareddy', date_of_entry: '2026-02-01', slug: 'lakshmipur' },
    { id: 's3', name: 'Green Valley', mandal: 'Chevella', district: 'Rangareddy', date_of_entry: '2026-02-10', slug: 'green-valley' },
  ],
  schools: [
    { id: 's1', name: 'ZPHS Rampur', mandal: 'Shamirpet', district: 'Medchal-Malkajgiri', date_of_entry: '2026-01-20', slug: 'zphs-rampur' },
    { id: 's2', name: 'Govt. High School Lakshmipur', mandal: 'Rajendranagar', district: 'Rangareddy', date_of_entry: '2026-02-05', slug: 'govt-high-lakshmipur' },
    { id: 's3', name: 'Model Primary Green Valley', mandal: 'Chevella', district: 'Rangareddy', date_of_entry: '2026-02-12', slug: 'model-primary-green-valley' },
  ],
  projects: [
    { id: 6, name: 'Tree Plantation Drive', mandal: 'Shamirpet', district: 'Medchal-Malkajgiri', date_of_entry: '2026-03-01', slug: 'tree-plantation-drive' },
    { id: 7, name: 'Water Harvest Project', mandal: 'Rajendranagar', district: 'Rangareddy', date_of_entry: '2026-03-05', slug: 'water-harvest-project' },
    { id: 8, name: 'Women SHG Support', mandal: 'Chevella', district: 'Rangareddy', date_of_entry: '2026-03-10', slug: 'women-shg-support' },
  ],
  volunteers: [
    { id: 'v1', name: 'Ravi Kumar', state: 'Telangana', mandal: '', district: 'Rangareddy', date_of_entry: '2026-01-18' },
    { id: 'v2', name: 'Sita Devi', state: 'Telangana', mandal: '', district: 'Medchal-Malkajgiri', date_of_entry: '2026-02-02' },
    { id: 'v3', name: 'Anil Reddy', state: 'Telangana', mandal: '', district: 'Rangareddy', date_of_entry: '2026-02-20' },
  ],
};
