import { supabase } from '@/api/supabaseClient';

const SUCCESS = 'success';

export async function fetchDonationTotal({ villageId, schoolId } = {}) {
  let query = supabase
    .from('donations')
    .select('amount')
    .eq('payment_status', SUCCESS);

  if (villageId) query = query.eq('village_id', villageId);
  else if (schoolId) query = query.eq('school_id', schoolId);
  else return 0;

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
}

function sumByKey(rows, key) {
  const totals = {};
  (rows || []).forEach((row) => {
    const id = row[key];
    if (!id) return;
    totals[id] = (totals[id] || 0) + (parseFloat(row.amount) || 0);
  });
  return totals;
}

export async function fetchDonationTotalsByVillageIds(villageIds = []) {
  if (!villageIds.length) return {};
  const { data, error } = await supabase
    .from('donations')
    .select('village_id, amount')
    .eq('payment_status', SUCCESS)
    .in('village_id', villageIds);
  if (error) throw error;
  const totals = Object.fromEntries(villageIds.map((id) => [id, 0]));
  return { ...totals, ...sumByKey(data, 'village_id') };
}

export async function fetchDonationTotalsBySchoolIds(schoolIds = []) {
  if (!schoolIds.length) return {};
  const { data, error } = await supabase
    .from('donations')
    .select('school_id, amount')
    .eq('payment_status', SUCCESS)
    .in('school_id', schoolIds);
  if (error) throw error;
  const totals = Object.fromEntries(schoolIds.map((id) => [id, 0]));
  return { ...totals, ...sumByKey(data, 'school_id') };
}
