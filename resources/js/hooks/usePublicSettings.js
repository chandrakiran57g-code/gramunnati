import { useEffect, useState } from 'react';
import { apiFetch } from '@/api/apiClient';

const DEFAULTS = {
  site_name: 'CMSR',
  contact_email: 'contact@cmsr.in',
  contact_phone: '+91 99999 99999',
  address: 'India — Nationwide Coverage',
};

let cache = null;
let inflight = null;

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

/**
 * Public, non-sensitive site settings (name, email, phone, address, logo).
 * Falls back to sensible defaults when a value is not set in Admin → Settings.
 */
export function usePublicSettings() {
  const [values, setValues] = useState(cache || {});

  useEffect(() => {
    let active = true;
    loadSettings().then((data) => { if (active) setValues(data); });
    return () => { active = false; };
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
