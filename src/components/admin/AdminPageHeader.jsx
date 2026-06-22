import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { adminRoutes } from '@/lib/adminRoutes';

export default function AdminPageHeader({ title, subtitle, gradient = 'brand-gradient', actions }) {
  return (
    <div className={`${gradient} py-8 px-6`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-white/70 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {actions}
          <Link to={adminRoutes.dashboard}>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              ← Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
