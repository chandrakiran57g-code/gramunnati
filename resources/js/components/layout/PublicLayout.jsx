import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from '@/components/ScrollToTop';
import GlobalSearchOverlay from '@/components/search/GlobalSearchOverlay';
import PathBreadcrumbs from '@/components/navigation/PathBreadcrumbs';
import { shouldShowBreadcrumbs } from '@/lib/routeBreadcrumbs';
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
      <main className="flex-1 pt-16">
        {showBreadcrumbs && (
          <div className="border-b border-border/40 bg-background/95">
            <div className="mx-auto flex max-w-7xl items-center px-4 py-2.5 sm:px-6">
              <PathBreadcrumbs />
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