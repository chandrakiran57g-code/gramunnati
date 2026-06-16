import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

const TITLES = {
  '/administrator/village-activities': 'Village Activities',
  '/administrator/village-donations': 'Village Donations',
  '/administrator/school-activities': 'School Activities',
  '/administrator/school-donations': 'School Donations',
  '/administrator/project-categories': 'Project Categories',
  '/administrator/impact-metrics': 'Impact Metrics',
  '/administrator/receipts': 'Donation Receipts',
  '/administrator/member-directory': 'Member Directory',
  '/administrator/notifications': 'Notifications',
};

export default function AdminPlaceholder() {
  const location = useLocation();
  const title = TITLES[location.pathname] || location.pathname.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Construction className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground mb-3">{title}</h1>
        <p className="text-muted-foreground mb-2">
          This module is coming soon and will be available in a future update.
        </p>
        <p className="text-sm text-muted-foreground/70">
          The backing data entity for this feature needs to be created first.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-xl text-sm text-muted-foreground">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          Under Development
        </div>
      </div>
    </div>
  );
}
