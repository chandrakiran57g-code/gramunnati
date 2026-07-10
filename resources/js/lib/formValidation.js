/**
 * Shared field validation for admin forms and public registration.
 */

export function normalizeMobile(value) {
  return String(value || '').replace(/\D/g, '');
}

/** Indian mobile: 10 digits starting with 6–9 */
export function isValidIndianMobile(mobile) {
  const digits = normalizeMobile(mobile);
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
