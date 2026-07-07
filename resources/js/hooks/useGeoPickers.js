import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/api/supabaseClient';

export function useGeoPickers(initial = {}) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [stateId, setStateIdRaw] = useState(initial.state_id ? String(initial.state_id) : '');
  const [districtId, setDistrictIdRaw] = useState(initial.district_id ? String(initial.district_id) : '');
  const [mandalId, setMandalIdRaw] = useState(initial.mandal_id ? String(initial.mandal_id) : '');

  useEffect(() => {
    supabase.from('states').select('id,name').order('name').then(({ data }) => setStates(data || []));
  }, []);

  useEffect(() => {
    if (!stateId) {
      setDistricts([]);
      return;
    }
    supabase.from('districts').select('id,name').eq('state_id', stateId).order('name').then(({ data }) => setDistricts(data || []));
  }, [stateId]);

  useEffect(() => {
    if (!districtId) {
      setMandals([]);
      return;
    }
    supabase.from('mandals').select('id,name').eq('district_id', districtId).order('name').then(({ data }) => setMandals(data || []));
  }, [districtId]);

  const setFromRecord = useCallback((record) => {
    setStateIdRaw(record?.state_id ? String(record.state_id) : '');
    setDistrictIdRaw(record?.district_id ? String(record.district_id) : '');
    setMandalIdRaw(record?.mandal_id ? String(record.mandal_id) : '');
  }, []);

  const onStateChange = (id) => {
    setStateIdRaw(id);
    setDistrictIdRaw('');
    setMandalIdRaw('');
  };

  const onDistrictChange = (id) => {
    setDistrictIdRaw(id);
    setMandalIdRaw('');
  };

  return {
    states,
    districts,
    mandals,
    stateId,
    districtId,
    mandalId,
    setStateId: onStateChange,
    setDistrictId: onDistrictChange,
    setMandalId: setMandalIdRaw,
    setFromRecord,
    geoIds: {
      state_id: stateId ? Number(stateId) : null,
      district_id: districtId ? Number(districtId) : null,
      mandal_id: mandalId ? Number(mandalId) : null,
    },
  };
}

export function useVillageOptions() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    supabase
      .from('villages')
      .select('id,village_name,slug')
      .is('deleted_at', null)
      .order('village_name')
      .then(({ data }) => setVillages(data || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { villages, loading, refresh };
}

export function useProjectCategoryOptions() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    supabase.from('project_categories').select('id,name').order('name').then(({ data }) => setCategories(data || []));
  }, []);

  return categories;
}

export function villageDisplay(v) {
  // Relations can arrive as objects {id, name} (eager-loaded) or as plain
  // strings depending on the API route. Handle both safely.
  const resolveName = (...sources) => {
    for (const s of sources) {
      if (!s) continue;
      if (typeof s === 'string') return s;
      if (typeof s === 'object' && s.name) return s.name;
      if (typeof s === 'object' && s.village_name) return s.village_name;
    }
    return '';
  };
  return {
    district: resolveName(v?.districts, v?.district) || '—',
    state: resolveName(v?.states, v?.state) || '—',
    mandal: resolveName(v?.mandals, v?.mandal),
  };
}

export function slugifyName(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function aggregateDonationsByType(donations) {
  const labels = { general: 'General', village: 'Village', school: 'School', project: 'Project' };
  const success = (donations || []).filter((d) => d.payment_status === 'success');
  return Object.entries(labels).map(([key, type]) => {
    const rows = success.filter((d) => d.target_type === key);
    return {
      type,
      amount: rows.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0),
      count: rows.length,
    };
  });
}
