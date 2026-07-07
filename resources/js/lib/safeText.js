/**
 * Safely extract a display string from a value that might be:
 * - A plain string → returned as-is
 * - An object with .name → returns the name
 * - An object with .village_name → returns the village_name
 * - null/undefined → returns the fallback
 *
 * Prevents React Error #31: "Objects are not valid as a React child"
 */
export function safeText(value, fallback = '') {
  if (value == null) return fallback;
  if (typeof value === 'string') return value || fallback;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    if (value.name) return value.name;
    if (value.village_name) return value.village_name;
    if (value.school_name) return value.school_name;
    if (value.title) return value.title;
    // Last resort — don't render the object
    return fallback;
  }
  return String(value) || fallback;
}

export default safeText;
