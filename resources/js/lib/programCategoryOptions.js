/** Load program category options from CMS programs (What We Do cards). */
import { cmsService } from '@/api/cms';

let cached = null;

export async function loadProgramCategoryOptions() {
  if (cached) return cached;
  try {
    const rows = await cmsService.listPrograms({ activeOnly: true });
    const active = (rows || []).filter((p) => p.status === 'active');
    cached = active.map((p) => ({ value: p.slug, label: p.title }));
    return cached;
  } catch {
    return [];
  }
}

export function clearProgramCategoryCache() {
  cached = null;
}

/** @deprecated use loadProgramCategoryOptions — kept for compatibility, now empty */
export const PROGRAM_CATEGORY_OPTIONS = [];
