export const CROP_AVAILABILITY_OPTIONS = [
  { value: 'in_season', label: 'In Season' },
  { value: 'harvesting', label: 'Harvesting' },
  { value: 'out_of_season', label: 'Out of Season' },
];

export function emptyVillageCrop() {
  return {
    name: '',
    image: '',
    price_per_kg: '',
    sowing_period: '',
    harvest_period: '',
    estimated_yield: '',
    cultivation_area: '',
    availability: 'in_season',
  };
}

export function availabilityLabel(value) {
  return CROP_AVAILABILITY_OPTIONS.find((o) => o.value === value)?.label || value || '—';
}

export function cropRowToEditor(row) {
  return {
    id: row.id,
    name: row.name || '',
    image: row.image || '',
    price_per_kg: row.price_per_kg ?? '',
    sowing_period: row.sowing_period || '',
    harvest_period: row.harvest_period || '',
    estimated_yield: row.estimated_yield || '',
    cultivation_area: row.cultivation_area || '',
    availability: row.availability || 'in_season',
  };
}

export function editorCropToRow(villageId, crop, index) {
  return {
    village_id: villageId,
    name: String(crop.name || '').trim(),
    image: crop.image || null,
    price_per_kg: crop.price_per_kg !== '' && crop.price_per_kg != null ? Number(crop.price_per_kg) : null,
    sowing_period: crop.sowing_period || null,
    harvest_period: crop.harvest_period || null,
    estimated_yield: crop.estimated_yield || null,
    cultivation_area: crop.cultivation_area || null,
    availability: crop.availability || 'in_season',
    sort_order: index,
  };
}
