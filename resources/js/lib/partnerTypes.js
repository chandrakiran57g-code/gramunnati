/** Partner organisation types — single source for admin form and public /partners page. */

export const PARTNER_TYPE_OPTIONS = [
  { value: 'ngo', label: 'NGO' },
  { value: 'company', label: 'Company' },
  { value: 'educational_institution', label: 'Educational Institution' },
  { value: 'govt_organisation', label: 'Govt Organisation' },
  { value: 'individual', label: 'Individual' },
  { value: 'csr_partner', label: 'CSR Partner' },
  { value: 'fpo_fpc', label: 'FPO/FPC' },
  { value: 'shg', label: 'SHG' },
  { value: 'others', label: 'Others' },
];

// Legacy values that may still exist on old rows.
const LEGACY_LABELS = { government: 'Govt Organisation', foundation: 'FPO/FPC' };

export function partnerTypeLabel(value) {
  return (
    PARTNER_TYPE_OPTIONS.find((o) => o.value === value)?.label
    || LEGACY_LABELS[value]
    || String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export const PARTNER_TYPE_COLORS = {
  ngo: 'bg-green-100 text-green-700',
  company: 'bg-blue-100 text-blue-700',
  educational_institution: 'bg-purple-100 text-purple-700',
  govt_organisation: 'bg-orange-100 text-orange-700',
  government: 'bg-orange-100 text-orange-700',
  individual: 'bg-gray-100 text-gray-700',
  csr_partner: 'bg-yellow-100 text-yellow-700',
  fpo_fpc: 'bg-pink-100 text-pink-700',
  foundation: 'bg-pink-100 text-pink-700',
  shg: 'bg-teal-100 text-teal-700',
  others: 'bg-slate-100 text-slate-700',
};
