import { supabase } from './supabaseClient';
import { getServiceDirectoryConfig, SAMPLE_DIRECTORY_ROWS } from '@/lib/serviceDirectory';

function mapVillageRow(v) {
  return {
    id: v.id,
    name: v.village_name,
    slug: v.slug,
    mandal: v.mandals?.name || v.mandal,
    district: v.districts?.name || v.district,
    date_of_entry: v.created_at,
  };
}

function mapSchoolRow(s) {
  return {
    id: s.id,
    name: s.school_name,
    slug: s.slug,
    mandal: s.villages?.mandals?.name || s.mandal,
    district: s.villages?.districts?.name || s.district,
    date_of_entry: s.created_at,
  };
}

function mapVolunteerRow(v) {
  return {
    id: v.id,
    name: v.full_name,
    mandal: '',
    district: v.district || '',
    date_of_entry: v.created_at,
  };
}

function mapProjectRow(p) {
  return {
    id: p.id,
    name: p.project_name,
    slug: p.slug,
    mandal: p.villages?.mandals?.name || p.mandal,
    district: p.villages?.districts?.name || p.district,
    date_of_entry: p.created_at,
    category: p.project_categories?.name,
  };
}

function matchesCategory(project, patterns = []) {
  const cat = (project.category || '').toLowerCase();
  return patterns.some((p) => cat.includes(p.toLowerCase()));
}

export const serviceDirectoryApi = {
  async loadRows(slug) {
    const config = getServiceDirectoryConfig(slug);
    if (!config) return [];

    if (config.type === 'villages') {
      const { data } = await supabase
        .from('villages')
        .select('id, slug, village_name, mandal, district, created_at, mandals(name), districts(name)')
        .is('deleted_at', null)
        .order('village_name');
      const rows = (data || []).map(mapVillageRow);
      return rows.length ? rows : SAMPLE_DIRECTORY_ROWS.villages;
    }

    if (config.type === 'schools') {
      const { data } = await supabase
        .from('schools')
        .select('id, slug, school_name, mandal, district, created_at, villages(mandal, district, mandals(name), districts(name))')
        .is('deleted_at', null)
        .order('school_name');
      const rows = (data || []).map(mapSchoolRow);
      return rows.length ? rows : SAMPLE_DIRECTORY_ROWS.schools;
    }

    if (config.type === 'volunteers') {
      const { data } = await supabase
        .from('volunteers')
        .select('id, full_name, district, created_at, status')
        .eq('status', 'active')
        .order('full_name');
      const rows = (data || []).map(mapVolunteerRow);
      return rows.length ? rows : SAMPLE_DIRECTORY_ROWS.volunteers;
    }

    if (config.type === 'projects') {
      const { data } = await supabase
        .from('projects')
        .select('id, slug, project_name, mandal, district, created_at, project_categories(name), villages(mandals(name), districts(name))')
        .is('deleted_at', null)
        .eq('status', 'active')
        .order('project_name');
      let rows = (data || []).map(mapProjectRow);
      if (config.categoryMatch?.length) {
        rows = rows.filter((r) => matchesCategory(r, config.categoryMatch));
      }
      return rows.length ? rows : SAMPLE_DIRECTORY_ROWS.projects;
    }

    return [];
  },
};
