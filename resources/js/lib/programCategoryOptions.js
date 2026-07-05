/** Load program category options from CMS programs (What We Do cards). */
import { cmsService } from '@/api/cms';
import { PROGRAMS as STATIC_PROGRAMS } from '@/lib/programs';

let cached = null;

export async function loadProgramCategoryOptions() {
  if (cached) return cached;
  try {
    const rows = await cmsService.listPrograms({ activeOnly: true });
    const active = (rows || []).filter((p) => p.status === 'active');
    if (active.length) {
      cached = active.map((p) => ({ value: p.slug, label: p.title }));
      return cached;
    }
  } catch {
    /* fall through */
  }
  cached = STATIC_PROGRAMS.map((p) => ({ value: p.slug, label: p.title }));
  return cached;
}

export function clearProgramCategoryCache() {
  cached = null;
}

/** @deprecated use loadProgramCategoryOptions */
export const PROGRAM_CATEGORY_OPTIONS = STATIC_PROGRAMS.map((p) => ({
  value: p.slug,
  label: p.title,
}));
