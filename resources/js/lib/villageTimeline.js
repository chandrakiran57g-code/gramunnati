/** Map village timeline editor events ↔ activity_logs rows. */

const TYPE_ICONS = {
  infrastructure: '💡',
  milestone: '🏘️',
  environment: '🌳',
  education: '📚',
  community: '👩',
  agriculture: '🌾',
  health: '🏥',
};

function isEmojiIcon(value) {
  const s = String(value || '').trim();
  return s && !/^https?:\/\//i.test(s);
}

export function formatTimelineDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

export function parseTimelineDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  const monthYear = raw.match(/^([A-Za-z]{3,9})\s+(\d{4})$/);
  if (monthYear) {
    const d = new Date(`${monthYear[1]} 1, ${monthYear[2]}`);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return null;
}

export function activityLogToTimelineEvent(row) {
  const type = row.activity_type || 'milestone';
  const icon = isEmojiIcon(row.image) ? row.image : (TYPE_ICONS[type] || '📌');
  return {
    id: row.id,
    date: row.activity_date || '',
    title: row.title || '',
    desc: row.description || '',
    type,
    icon,
  };
}

export function timelineEventToActivityLog(entityId, event, loggableType = 'village') {
  return {
    loggable_type: loggableType,
    loggable_id: entityId,
    title: String(event.title || '').trim(),
    description: event.desc || null,
    activity_type: event.type || 'milestone',
    image: isEmojiIcon(event.icon) ? event.icon : null,
    activity_date: parseTimelineDate(event.date),
  };
}

export function defaultIconForType(type) {
  return TYPE_ICONS[type] || '📌';
}
