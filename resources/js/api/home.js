import { supabase } from './supabaseClient';
import {
  VILLAGE_HERO_PHOTOS,
  CATEGORY_LABELS,
  buildHeroSlides,
  isApprovedVillageImage,
} from '@/lib/villageImages';
import { mergeHomePageWithDemo, getDemoPageData, useDemoData } from '@/data/demoData';

const EMPTY_STATS = {
  villages: 0,
  schools: 0,
  projects: 0,
  donations: 0,
  totalAmount: 0,
  volunteers: 0,
  beneficiaries: 0,
};

async function fetchSection(fn, fallback) {
  try {
    return await fn();
  } catch (err) {
    console.error('Home page section failed', err);
    return fallback;
  }
}

const DEFAULT_HERO_PHOTOS = VILLAGE_HERO_PHOTOS;

const PROGRAM_TONES = [
  'home-program-earth',
  'home-program-clay',
  'home-program-leaf',
  'home-program-water',
  'home-program-terracotta',
  'home-program-wheat',
];

const PROGRAM_SPANS = [
  'lg:col-span-2 lg:row-span-2',
  'lg:col-span-1',
  'lg:col-span-1',
  'lg:col-span-1',
  'lg:col-span-1',
  'lg:col-span-2',
];

function formatINR(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr+`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L+`;
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function activityIcon(type) {
  const map = {
    donation: '💛',
    volunteer: '🌱',
    project: '📋',
    village: '🏘️',
    school: '🏫',
    tree: '🌳',
    water: '💧',
    default: '✨',
  };
  return map[type] || map.default;
}

export const homeService = {
  async getPageData() {
    if (useDemoData()) {
      return getDemoPageData();
    }

    const [
      stats,
      villages,
      schools,
      projects,
      programs,
      stories,
      testimonials,
      news,
      events,
      activity,
      heroPhotos,
      monthlyDonations,
      donationBreakdown,
      stateStats,
      partners,
      gallery,
      urgentProjects,
    ] = await Promise.all([
      fetchSection(() => this.getStats(), EMPTY_STATS),
      fetchSection(() => this.getFeaturedVillages(), []),
      fetchSection(() => this.getFeaturedSchools(), []),
      fetchSection(() => this.getActiveProjects(), []),
      fetchSection(() => this.getPrograms(), []),
      fetchSection(() => this.getFeaturedStories(), []),
      fetchSection(() => this.getFeaturedTestimonials(), []),
      fetchSection(() => this.getRecentNews(), []),
      fetchSection(() => this.getUpcomingEvents(), []),
      fetchSection(() => this.getLiveActivity(), []),
      fetchSection(() => this.getHeroPhotos(), []),
      fetchSection(() => this.getMonthlyDonationTotal(), 0),
      fetchSection(() => this.getDonationBreakdown(), []),
      fetchSection(() => this.getStateWiseStats(), []),
      fetchSection(() => this.getPartners(), []),
      fetchSection(() => this.getGalleryImages(), []),
      fetchSection(() => this.getUrgentProjects(), []),
    ]);

    return mergeHomePageWithDemo({
      stats,
      villages,
      schools,
      projects,
      programs,
      stories,
      testimonials,
      news,
      events,
      activity,
      heroPhotos,
      monthlyDonations,
      donationBreakdown,
      stateStats,
      partners,
      gallery,
      urgentProjects,
    });
  },

  async getStats() {
    const [villages, schools, projects, donations, volunteers, beneficiaries] = await Promise.allSettled([
      supabase.from('villages').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('schools').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('projects').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('status', 'active'),
      supabase.from('donations').select('amount').eq('payment_status', 'success'),
      supabase.from('volunteers').select('*', { count: 'exact', head: true }),
      supabase.from('beneficiaries').select('*', { count: 'exact', head: true }),
    ]);

    const donationRows = donations.status === 'fulfilled' ? donations.value.data || [] : [];
    const totalAmount = donationRows.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);

    return {
      villages: villages.status === 'fulfilled' ? villages.value.count || 0 : 0,
      schools: schools.status === 'fulfilled' ? schools.value.count || 0 : 0,
      projects: projects.status === 'fulfilled' ? projects.value.count || 0 : 0,
      donations: donationRows.length,
      totalAmount,
      volunteers: volunteers.status === 'fulfilled' ? volunteers.value.count || 0 : 0,
      beneficiaries: beneficiaries.status === 'fulfilled' ? beneficiaries.value.count || 0 : 0,
    };
  },

  async getFeaturedVillages() {
    const { data } = await supabase
      .from('villages')
      .select('*, states(name), districts(name)')
      .eq('is_featured', true)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(6);
    return data || [];
  },

  async getFeaturedSchools() {
    const { data } = await supabase
      .from('schools')
      .select('*, villages(village_name, slug), states(name)')
      .eq('is_featured', true)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(6);
    return data || [];
  },

  async getActiveProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*, project_categories(name, icon), villages(village_name, slug)')
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(6);
    return data || [];
  },

  async getPrograms() {
    const { data } = await supabase
      .from('programs')
      .select('*')
      .order('sort_order', { ascending: true })
      .limit(8);

    const items = data?.length ? data : [];
    return items.map((p, i) => ({
      id: p.id,
      title: p.title,
      description: p.description || p.short_description || '',
      icon: p.icon || '🌾',
      slug: p.slug,
      tone: PROGRAM_TONES[i % PROGRAM_TONES.length],
      span: PROGRAM_SPANS[i % PROGRAM_SPANS.length],
    }));
  },

  async getFeaturedStories() {
    const { data } = await supabase
      .from('success_stories')
      .select('*, villages(village_name), schools(school_name)')
      .eq('is_featured', true)
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .limit(6);
    return data || [];
  },

  async getFeaturedTestimonials() {
    const { data: setting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'featured_testimonials')
      .maybeSingle();
    if (setting?.value) {
      try {
        const parsed = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch {
        /* fall through */
      }
    }
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_featured', true)
      .order('sort_order', { ascending: true })
      .limit(6);
    return data || [];
  },

  async getRecentNews() {
    const { data } = await supabase
      .from('news')
      .select('id, title, slug, content, featured_image, published_at')
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .limit(4);
    return data || [];
  },

  async getUpcomingEvents() {
    const { data } = await supabase
      .from('events')
      .select('id, title, slug, start_date, location, featured_image')
      .is('deleted_at', null)
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(4);
    return data || [];
  },

  async getHeroPhotos() {
    const [villagesRes, schoolsRes] = await Promise.allSettled([
      supabase
        .from('villages')
        .select('village_name, cover_image, short_description')
        .not('cover_image', 'is', null)
        .is('deleted_at', null)
        .order('is_featured', { ascending: false })
        .limit(5),
      supabase
        .from('schools')
        .select('school_name, cover_image, short_description')
        .not('cover_image', 'is', null)
        .is('deleted_at', null)
        .order('is_featured', { ascending: false })
        .limit(5),
    ]);

    const villages = villagesRes.status === 'fulfilled' ? villagesRes.value.data : [];
    const schools = schoolsRes.status === 'fulfilled' ? schoolsRes.value.data : [];

    const fromDb = [
      ...(villages || [])
        .filter((v) => isApprovedVillageImage(v.cover_image))
        .map((v) => ({
          url: v.cover_image.trim(),
          alt: v.village_name,
          caption: v.short_description || `${v.village_name} — hamara gaon`,
          category: 'village',
        })),
      ...(schools || [])
        .filter((s) => isApprovedVillageImage(s.cover_image))
        .map((s) => ({
          url: s.cover_image.trim(),
          alt: s.school_name,
          caption: s.short_description || `${s.school_name} — gaon ki school`,
          category: 'school',
        })),
    ];

    const unique = fromDb.filter((p, i, arr) => arr.findIndex((x) => x.url === p.url) === i);
    return buildHeroSlides(unique);
  },

  async getLiveActivity() {
    const [logs, donations, volunteers] = await Promise.allSettled([
      supabase
        .from('activity_logs')
        .select('*')
        .order('activity_date', { ascending: false })
        .limit(8),
      supabase
        .from('donations')
        .select('amount, donor_name, created_at, target_type, villages(village_name), schools(school_name), projects(project_name)')
        .eq('payment_status', 'success')
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('volunteers')
        .select('created_at, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(4),
    ]);

    const items = [];

    if (donations.status === 'fulfilled') {
      (donations.value.data || []).forEach((d) => {
        const target = d.villages?.village_name || d.schools?.school_name || d.projects?.project_name || d.target_type;
        items.push({
          id: `don-${d.created_at}`,
          text: `₹${Number(d.amount).toLocaleString('en-IN')} donated${target ? ` to ${target}` : ''}`,
          time: timeAgo(d.created_at),
          icon: '💛',
          date: d.created_at,
        });
      });
    }

    if (logs.status === 'fulfilled') {
      (logs.value.data || []).forEach((l) => {
        items.push({
          id: `log-${l.id}`,
          text: l.title || l.description || 'New village activity',
          time: timeAgo(l.activity_date || l.created_at),
          icon: activityIcon(l.activity_type),
          date: l.activity_date || l.created_at,
        });
      });
    }

    if (volunteers.status === 'fulfilled') {
      (volunteers.value.data || []).forEach((v) => {
        items.push({
          id: `vol-${v.created_at}`,
          text: `${v.full_name || v.profiles?.full_name || 'Someone'} joined as volunteer`,
          time: timeAgo(v.created_at),
          icon: '🌱',
          date: v.created_at,
        });
      });
    }

    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    return items.slice(0, 12);
  },

  async getMonthlyDonationTotal() {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('donations')
      .select('amount')
      .eq('payment_status', 'success')
      .gte('created_at', start.toISOString());

    return (data || []).reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);
  },

  async getDonationBreakdown() {
    const { data } = await supabase
      .from('donations')
      .select('target_type')
      .eq('payment_status', 'success');

    const counts = { village: 0, school: 0, project: 0, general: 0 };
    (data || []).forEach((d) => {
      const t = d.target_type || 'general';
      counts[t] = (counts[t] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

    return [
      { name: 'Village', value: Math.round((counts.village / total) * 100), color: '#8B6914' },
      { name: 'School', value: Math.round((counts.school / total) * 100), color: '#6B5344' },
      { name: 'Project', value: Math.round((counts.project / total) * 100), color: '#5C4033' },
      { name: 'General', value: Math.round((counts.general / total) * 100), color: '#D4A017' },
    ];
  },

  async getStateWiseStats() {
    const { data: villages } = await supabase
      .from('villages')
      .select('state_id, states(name)')
      .is('deleted_at', null);

    const { data: schools } = await supabase
      .from('schools')
      .select('state_id, states(name)')
      .is('deleted_at', null);

    const { data: projects } = await supabase
      .from('projects')
      .select('state_id, states(name)')
      .is('deleted_at', null);

    const map = {};
    const add = (rows, key) => {
      (rows || []).forEach((r) => {
        const state = r.states?.name || 'Other';
        if (!map[state]) map[state] = { state, villages: 0, schools: 0, projects: 0 };
        map[state][key]++;
      });
    };

    add(villages, 'villages');
    add(schools, 'schools');
    add(projects, 'projects');

    return Object.values(map)
      .sort((a, b) => b.villages + b.schools - (a.villages + a.schools))
      .slice(0, 6);
  },

  async getPartners() {
    const { data } = await supabase
      .from('partners')
      .select('id, name, logo, slug')
      .order('name', { ascending: true })
      .limit(12);
    return data || [];
  },

  async getGalleryImages() {
    const { data } = await supabase
      .from('galleries')
      .select('id, title, image_path, galleryable_type')
      .not('image_path', 'is', null)
      .order('created_at', { ascending: false })
      .limit(14);
    return data || [];
  },

  async getUrgentProjects() {
    // Admin-curated Need Support cards only — no fallback to the projects table,
    // otherwise deleted/seeded projects reappear as "mock" cards.
    const { needsSupportService } = await import('./needsSupport');
    return needsSupportService.getHomepageItems(4);
  },

  formatINR,
  buildHeroSlides,
  CATEGORY_LABELS,
  DEFAULT_HERO_PHOTOS,
};
