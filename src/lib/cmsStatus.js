/** Supabase `content_status_type` enum — cms_pages uses active/inactive, not published/draft */
export const CMS_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export function isCmsPagePublic(status) {
  return status === CMS_STATUS.ACTIVE;
}
