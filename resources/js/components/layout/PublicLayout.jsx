import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from '@/components/ScrollToTop';
import GlobalSearchOverlay from '@/components/search/GlobalSearchOverlay';
import PathBreadcrumbs from '@/components/navigation/PathBreadcrumbs';
import { shouldShowBreadcrumbs, breadcrumbTone } from '@/lib/routeBreadcrumbs';
import { InstantNavigationProvider } from '@/lib/instantNavigation';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const showBreadcrumbs = shouldShowBreadcrumbs(pathname);

  return (
    <InstantNavigationProvider>
      <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <GlobalSearchOverlay />
      <Navbar />
      <main className="relative flex-1 pt-16">
        {showBreadcrumbs && (
          // Overlaid on top of each page's hero (no dedicated row). Wrapper is
          // click-through; only the breadcrumb nav itself is interactive.
          <div className="pointer-events-none absolute inset-x-0 top-16 z-30">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
              <PathBreadcrumbs tone={breadcrumbTone(pathname)} className="pointer-events-auto inline-flex" />
            </div>
          </div>
        )}
        <Outlet />
      </main>
      <Footer />
      </div>
    </InstantNavigationProvider>
  );
}