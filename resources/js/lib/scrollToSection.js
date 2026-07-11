export function getNavbarOffset() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--navbar-height').trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 64;
}

export function scrollToSection(sectionId, { behavior = 'smooth', extraOffset = 8 } = {}) {
  if (!sectionId || typeof window === 'undefined') return false;

  const element = document.getElementById(sectionId);
  if (!element) return false;

  const top = element.getBoundingClientRect().top + window.scrollY - getNavbarOffset() - extraOffset;
  window.scrollTo({
    top: Math.max(0, top),
    left: 0,
    behavior,
  });
  return true;
}
