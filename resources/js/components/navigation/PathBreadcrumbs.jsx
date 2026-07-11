import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  buildAdminBreadcrumbs,
  buildPublicBreadcrumbs,
  shouldShowBreadcrumbs,
} from '@/lib/routeBreadcrumbs';
import { useBreadcrumbContext } from '@/lib/BreadcrumbContext';

const DEFAULT_EXCLUDED = new Set(['/']);

function renderLabel(crumb, isLast) {
  const text = crumb.decorated
    ? `✦${crumb.label.toLowerCase()} ✦`
    : crumb.label;

  if (isLast || !crumb.to) {
    return (
      <span
        className={cn(
          'truncate',
          isLast ? 'font-medium text-foreground' : 'text-muted-foreground',
        )}
        aria-current={isLast ? 'page' : undefined}
      >
        {text}
      </span>
    );
  }

  return (
    <Link
      to={crumb.to}
      className="truncate text-primary transition-colors hover:text-primary/80 hover:underline"
    >
      {text}
    </Link>
  );
}

export default function PathBreadcrumbs({
  className,
  excludedPaths = DEFAULT_EXCLUDED,
  mode = 'public',
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

  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0 text-sm', className)}>
      <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-muted-foreground">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={`${crumb.to || ''}-${crumb.label}-${index}`} className="inline-flex min-w-0 items-center gap-1.5">
              {index > 0 && <span className="text-muted-foreground/70" aria-hidden="true">/</span>}
              {renderLabel(crumb, isLast)}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
