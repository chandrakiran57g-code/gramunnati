/** Fired after admin creates/updates/deletes platform content — Navbar and pages listen for this. */
export const PLATFORM_DATA_CHANGED = 'gramunnati-platform-data-changed';
export const PLATFORM_STORAGE_KEY = 'gramunnati-platform-data-changed';

export function notifyPlatformDataChanged(detail = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PLATFORM_DATA_CHANGED, { detail }));
  try {
    localStorage.setItem(PLATFORM_STORAGE_KEY, JSON.stringify({ ts: Date.now(), detail }));
  } catch {
    /* ignore quota / private mode */
  }
}
