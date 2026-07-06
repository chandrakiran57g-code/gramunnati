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

