import { Link } from 'react-router-dom';
import { adminRoutes } from '@/lib/adminRoutes';
import { ChevronRight } from 'lucide-react';

/**
 * Consistent admin page wrapper — flat header, no marketing hero.
 */
export default function AdminShell({
  title,
  description,
  section,
  actions,
  breadcrumbs = [],
  children,
  maxWidth = 'max-w-6xl',
}) {
  return (
    <div className="min-h-full bg-[#f4f6f4]">
      <div className="border-b border-border bg-white px-4 py-5 sm:px-6">
        <div className={`mx-auto ${maxWidth}`}>
          {breadcrumbs.length > 0 && (
            <nav className="mb-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <Link to={adminRoutes.dashboard} className="hover:text-foreground">Dashboard</Link>
              {breadcrumbs.map((crumb) => (
                <span key={crumb.label} className="flex items-center gap-1">
                  <ChevronRight className="h-3 w-3" />
                  {crumb.to ? (
                    <Link to={crumb.to} className="hover:text-foreground">{crumb.label}</Link>
                  ) : (
                    <span className="text-foreground">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              {section && (
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">{section}</p>
              )}
              <h1 className="font-heading text-2xl font-bold text-foreground">{title}</h1>
              {description && (
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
          </div>
        </div>
      </div>
      <div className={`mx-auto px-4 py-6 sm:px-6 ${maxWidth}`}>{children}</div>
    </div>
  );
}
