/**
 * Shared field validation for admin forms and public registration.
 */

export function normalizeMobile(value) {
  return String(value || '').replace(/\D/g, '');
}

/** Keep only digits — for numeric fields; allows clearing to empty. */
export function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '');
}

/** Sanitize a mobile field as the user types: digits only, max 10. */
export function sanitizeMobileInput(value) {
  return digitsOnly(value).slice(0, 10);
}

/** Indian mobile: 10 digits starting with 6–9 (accepts +91 / leading-0 formats) */
export function isValidIndianMobile(mobile) {
  let digits = normalizeMobile(mobile);
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits);
}

export function isValidEmail(email) {
  const trimmed = String(email || '').trim();
  if (!trimmed) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function isValidUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed) return true;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    new URL(withProtocol);
    return true;
  } catch {
    return false;
  }
}

export function isValidSlug(slug) {
  const trimmed = String(slug || '').trim();
  if (!trimmed) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed);
}

/**
 * Validate common contact fields. Returns error message or null.
 */
export function validateContactFields({
  email,
  mobile,
  website,
  requireMobile = false,
  requireEmail = false,
} = {}) {
  if (requireEmail && !String(email || '').trim()) {
    return 'Email is required';
  }
  if (String(email || '').trim() && !isValidEmail(email)) {
    return 'Enter a valid email address';
  }
  if (requireMobile && !String(mobile || '').trim()) {
    return 'Mobile number is required';
  }
  if (String(mobile || '').trim() && !isValidIndianMobile(mobile)) {
    return 'Enter a valid 10-digit Indian mobile number (starting with 6–9)';
  }
  if (String(website || '').trim() && !isValidUrl(website)) {
    return 'Enter a valid website URL';
  }
  return null;
}
