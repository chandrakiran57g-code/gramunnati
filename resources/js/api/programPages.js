/** Per-program detail page content (Learn More pages) stored in settings. */
import { cmsService } from '@/api/cms';
import { adminDbMutation } from '@/lib/adminDb';
import { supabase } from '@/api/supabaseClient';
import { parseSettingsValue, serializeSettingsValue } from '@/lib/settingsStore';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';

const STORE_KEY = 'program_detail_pages';

export function emptyProgramPage(programSlug = '') {
  return {
    program_slug: programSlug,
    long_description: '',
    long_description_te: '',
    objectives: '',
    objectives_te: '',
    activities: '',
    activities_te: '',
    impact_highlights: '',
    impact_highlights_te: '',
    gallery_images: '',
    stats: { villages: 0, schools: 0, volunteers: 0, donations: 0 },
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
    notifyPlatformDataChanged({ type: 'program_pages' });
  });
}

export const programPagesService = {
  async listAll() {
    return readStore();
  },

  async getPage(programSlug) {
    if (!programSlug) return null;
    const store = await readStore();
    return store[programSlug] || null;
  },

  async savePage(programSlug, data) {
    const store = await readStore();
    store[programSlug] = { ...emptyProgramPage(programSlug), ...data, program_slug: programSlug };
    await writeStore(store);
    return store[programSlug];
  },
};
