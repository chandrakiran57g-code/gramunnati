/** Fired after admin creates/updates/deletes platform content — Navbar and pages listen for this. */
export const PLATFORM_DATA_CHANGED = 'gramunnati-platform-data-changed';

export function notifyPlatformDataChanged(detail = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PLATFORM_DATA_CHANGED, { detail }));
  }
}
