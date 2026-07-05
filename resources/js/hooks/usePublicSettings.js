import { useEffect, useState } from 'react';
import { apiFetch } from '@/api/apiClient';
import { PLATFORM_DATA_CHANGED } from '@/lib/platformRefresh';

const DEFAULTS = {
  site_name: 'CMSR',
  contact_email: 'contact@cmsr.in',
  contact_phone: '+91 99999 99999',
  address: 'India — Nationwide Coverage',
};

let cache = null;
let inflight = null;

export function invalidatePublicSettingsCache() {
  cache = null;
  inflight = null;
}

async function loadSettings() {
  if (cache) return cache;
  if (!inflight) {
    inflight = apiFetch('/cms/settings')
      .then((data) => {
        cache = data && typeof data === 'object' ? data : {};
        return cache;
      })
      .catch(() => {
        cache = {};
        return cache;
      });
  }
  return inflight;
}

export function usePublicSettings() {
  const [values, setValues] = useState(cache || {});

  useEffect(() => {
    let active = true;
    const refresh = () => {
      invalidatePublicSettingsCache();
      loadSettings().then((data) => { if (active) setValues(data); });
    };
    refresh();
    const onChange = (e) => {
      if (!e?.detail?.type || e.detail.type === 'settings') refresh();
    };
    window.addEventListener(PLATFORM_DATA_CHANGED, onChange);
    return () => {
      active = false;
      window.removeEventListener(PLATFORM_DATA_CHANGED, onChange);
    };
  }, []);

  return {
    siteName: values.site_name || DEFAULTS.site_name,
    contactEmail: values.contact_email || DEFAULTS.contact_email,
    contactPhone: values.contact_phone || DEFAULTS.contact_phone,
    address: values.address || DEFAULTS.address,
    addressTe: values.address_te || '',
    siteNameTe: values.site_name_te || '',
    logoUrl: values.logo_url || '',
    raw: values,
  };
}

export default usePublicSettings;
