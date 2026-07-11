import { safeText } from '@/lib/safeText';

/** Flatten joined state/district/mandal for public village cards and detail pages. */
export function normalizeVillageRecord(village) {
  if (!village) return village;
  return {
    ...village,
    state: safeText(village.states || village.state),
    district: safeText(village.districts || village.district),
    mandal: safeText(village.mandals || village.mandal),
  };
}

export function normalizeSchoolRecord(school) {
  if (!school) return school;
  const village = school.villages || {};
  return {
    ...school,
    village_name: safeText(village.village_name || school.village_name),
    district: safeText(village.districts || school.district),
    state: safeText(village.states || school.state),
  };
}
