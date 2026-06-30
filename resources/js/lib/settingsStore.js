/** Parse settings.value whether stored as JSON string or jsonb object. */
export function parseSettingsValue(raw, fallback = null) {
  if (raw == null || raw === '') return fallback;
  try {
    let parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function serializeSettingsValue(value) {
  return JSON.stringify(value);
}
