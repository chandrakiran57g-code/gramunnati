export function emptySchoolRequirement() {
  return {
    title: '',
    needed_amount: '',
    raised_amount: '',
  };
}

export function requirementRowToEditor(row) {
  return {
    id: row.id,
    title: row.title || '',
    needed_amount: row.needed_amount ?? '',
    raised_amount: row.raised_amount ?? '',
  };
}

export function editorRequirementToRow(schoolId, req, index) {
  return {
    school_id: schoolId,
    title: String(req.title || '').trim(),
    needed_amount: req.needed_amount !== '' && req.needed_amount != null ? Number(req.needed_amount) : 0,
    raised_amount: req.raised_amount !== '' && req.raised_amount != null ? Number(req.raised_amount) : 0,
    sort_order: index,
    status: 'open',
  };
}
