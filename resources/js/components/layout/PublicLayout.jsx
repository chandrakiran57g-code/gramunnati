import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from '@/components/ScrollToTop';
import GlobalSearchOverlay from '@/components/search/GlobalSearchOverlay';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <GlobalSearchOverlay />
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}