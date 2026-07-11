/** Per-card Need Support detail pages stored in settings. */
import { cmsService } from '@/api/cms';
import { adminDbMutation } from '@/lib/adminDb';
import { supabase } from '@/api/supabaseClient';
import { parseSettingsValue, serializeSettingsValue } from '@/lib/settingsStore';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';

const STORE_KEY = 'need_support_detail_pages';

export function emptyNeedSupportPage(cardSlug = '') {
  return {
    card_slug: cardSlug,
    long_description: '',
    long_description_te: '',
    objectives: '',
    objectives_te: '',
    activities: '',
    activities_te: '',
    impact_highlights: '',
    impact_highlights_te: '',
    gallery_images: '',
    hero_image: '',
    stats: { villages: 0, schools: 0, volunteers: 0, donations: 0 },
    development_score: {
      education: 0,
      infrastructure: 0,
      environment: 0,
      agriculture: 0,
      community: 0,
    },
    statistics: {
      population: '',
      literacy_rate: '',
      beneficiaries: '',
      projects_count: '',
    },
    location: { district: '', state: '', pincode: '' },
    donations: { goal: 0, raised: 0 },
    card: {
      enable_donate: true,
      enable_details: true,
      enable_follow: false,
      enable_compare: false,
    },
  };
}

async function readStore() {
  const raw = await cmsService.getSetting(STORE_KEY);
  const parsed = parseSettingsValue(raw);
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
}

async function writeStore(store) {
  await adminDbMutation(async () => {
    const { error } = await supabase.from('settings').upsert(
      { key: STORE_KEY, value: serializeSettingsValue(store) },
      { onConflict: 'key' }
    );
    if (error) throw error;
    notifyPlatformDataChanged({ type: 'need_support_pages' });
  });
}

export const needSupportPagesService = {
  async listAll() {
    return readStore();
  },

  async getPage(cardSlug) {
    if (!cardSlug) return null;
    const store = await readStore();
    return store[cardSlug] || null;
  },

  async savePage(cardSlug, data) {
    const store = await readStore();
    store[cardSlug] = { ...emptyNeedSupportPage(cardSlug), ...data, card_slug: cardSlug };
    await writeStore(store);
    return store[cardSlug];
  },
};
