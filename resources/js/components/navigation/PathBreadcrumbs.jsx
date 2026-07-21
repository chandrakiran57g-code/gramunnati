import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  buildAdminBreadcrumbs,
  buildPublicBreadcrumbs,
  shouldShowBreadcrumbs,
} from '@/lib/routeBreadcrumbs';
import { useBreadcrumbContext } from '@/lib/BreadcrumbContext';

const DEFAULT_EXCLUDED = new Set(['/']);

// Two visual tones so breadcrumbs stay legible whether they sit on a plain
// light page or overlay a dark hero banner.
const TONES = {
  onLight: {
    list: 'text-muted-foreground',
    sep: 'text-muted-foreground/70',
    current: 'font-medium text-foreground',
    inactive: 'text-muted-foreground',
    link: 'text-primary transition-colors hover:text-primary/80 hover:underline',
  },
  onDark: {
    list: 'text-white/75 [text-shadow:_0_1px_3px_rgba(0,0,0,0.55)]',
    sep: 'text-white/50',
    current: 'font-semibold text-white',
    inactive: 'text-white/75',
    link: 'text-white/85 transition-colors hover:text-white hover:underline',
  },
};

function renderLabel(crumb, isLast, styles) {
  const text = crumb.decorated
    ? `✦${crumb.label.toLowerCase()} ✦`
    : crumb.label;

  if (isLast || !crumb.to) {
    return (
      <span
        className={cn('truncate', isLast ? styles.current : styles.inactive)}
        aria-current={isLast ? 'page' : undefined}
      >
        {text}
      </span>
    );
  }

  return (
    <Link to={crumb.to} className={cn('truncate', styles.link)}>
      {text}
    </Link>
  );
}

export default function PathBreadcrumbs({
  className,
  excludedPaths = DEFAULT_EXCLUDED,
  mode = 'public',
  tone = 'onLight',
}) {
  const { pathname } = useLocation();
  const { currentLabel } = useBreadcrumbContext();

  if (!shouldShowBreadcrumbs(pathname, excludedPaths)) {
    return null;
  }

  const isAdminPath = pathname.startsWith('/admin');
  const crumbs = isAdminPath || mode === 'admin'
    ? buildAdminBreadcrumbs(pathname, currentLabel)
    : buildPublicBreadcrumbs(pathname, currentLabel);

  if (!crumbs.length) return null;

  const styles = TONES[tone] || TONES.onLight;

  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0 text-sm', className)}>
      <ol className={cn('flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1', styles.list)}>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={`${crumb.to || ''}-${crumb.label}-${index}`} className="inline-flex min-w-0 items-center gap-1.5">
              {index > 0 && <span className={styles.sep} aria-hidden="true">/</span>}
              {renderLabel(crumb, isLast, styles)}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
