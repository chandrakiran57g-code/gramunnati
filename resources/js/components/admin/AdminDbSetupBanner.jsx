import { AlertCircle } from 'lucide-react';

/**
 * Shown when admin lists are empty — explains public navbar fallbacks vs database content.
 */
export default function AdminDbSetupBanner({ itemLabel = 'items' }) {
  return (
    <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <div>
        <p className="font-semibold">No {itemLabel} in the database yet</p>
        <p className="mt-1 text-amber-900/90">
          The public website may still show menu links from built-in demo data until MySQL/SQLite is seeded.
          On your PC run:{' '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">php artisan migrate:fresh --seed</code>
          {' '}then refresh this page. On cPanel, import <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">database/cmsrr.sql</code>.
        </p>
      </div>
    </div>
  );
}
