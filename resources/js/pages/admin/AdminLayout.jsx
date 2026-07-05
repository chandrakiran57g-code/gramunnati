import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LogOut, Menu } from 'lucide-react';
import { clearAdminSession } from '@/lib/adminAuth';
import { adminRoutes } from '@/lib/adminRoutes';
import { adminSidebarSections } from '@/lib/adminNavConfig';
import { BRAND_LOGO_URL, BRAND_NAME } from '@/lib/brand';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const handleAdminLogout = () => {
    clearAdminSession();
    navigate(adminRoutes.login, { replace: true });
  };

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const toggleSection = (label) => {
    setExpandedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const anyDescendantActive = (item) => {
    if (item.path && isActive(item.path)) return true;
    return item.children?.some((child) => anyDescendantActive(child)) || false;
  };

  useEffect(() => {
    adminSidebarSections.forEach((section) => {
      if (section.children?.some((child) => anyDescendantActive(child))) {
        setExpandedSections((prev) => ({ ...prev, [section.label]: true }));
        section.children.forEach((child) => {
          if (child.children && anyDescendantActive(child)) {
            setExpandedSections((prev) => ({ ...prev, [`${section.label}/${child.label}`]: true }));
          }
        });
      }
    });
  }, [location.pathname]);

  const Sidebar = () => (
    <div className="flex h-full w-64 flex-col border-r border-white/5 bg-[#1a2e1f] text-white">
      <div className="flex items-center gap-3 border-b border-white/10 p-4">
        <img src={BRAND_LOGO_URL} alt={BRAND_NAME} className="h-9 w-9 rounded-full bg-white/10 object-contain" />
        <div>
          <div className="font-heading text-sm font-bold">{BRAND_NAME}</div>
          <div className="text-[11px] text-white/50">Admin Panel</div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {adminSidebarSections.map((section) => {
          if (!section.children) {
            return (
              <Link
                key={section.path}
                to={section.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive(section.path, section.exact)
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <section.icon className="h-4 w-4 shrink-0" />
                {section.label}
              </Link>
            );
          }

          const isExpanded = expandedSections[section.label];
          const anyChildActive = section.children.some((child) => anyDescendantActive(child));

          return (
            <div key={section.label}>
              <button
                type="button"
                onClick={() => toggleSection(section.label)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  anyChildActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <section.icon className={`h-4 w-4 shrink-0 ${section.color || ''}`} />
                <span className="flex-1 text-left">{section.label}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="mb-1 ml-3 mt-0.5 space-y-0.5 overflow-hidden border-l border-white/10"
                  >
                    {section.children.map((child) => {
                      if (!child.children) {
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-2.5 rounded-r-lg py-1.5 pl-3 pr-3 text-[13px] transition-all ${
                              isActive(child.path)
                                ? 'bg-primary/25 font-medium text-white'
                                : 'text-white/50 hover:bg-white/5 hover:text-white/90'
                            }`}
                          >
                            <child.icon className="h-3.5 w-3.5 shrink-0" />
                            {child.label}
                          </Link>
                        );
                      }

                      const subKey = `${section.label}/${child.label}`;
                      const subExpanded = expandedSections[subKey];
                      const subActive = anyDescendantActive(child);

                      return (
                        <div key={subKey}>
                          <button
                            type="button"
                            onClick={() => toggleSection(subKey)}
                            className={`flex w-full items-center gap-2.5 rounded-r-lg py-1.5 pl-3 pr-3 text-[13px] transition-all ${
                              subActive ? 'text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/90'
                            }`}
                          >
                            <child.icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="flex-1 text-left">{child.label}</span>
                            <ChevronDown className={`h-3 w-3 transition-transform ${subExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence initial={false}>
                            {subExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="ml-4 space-y-0.5 overflow-hidden border-l border-white/10"
                              >
                                {child.children.map((sub) => (
                                  <Link
                                    key={sub.path}
                                    to={sub.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-2 rounded-r-lg py-1.5 pl-3 pr-3 text-[12px] transition-all ${
                                      isActive(sub.path)
                                        ? 'bg-primary/25 font-medium text-white'
                                        : 'text-white/50 hover:bg-white/5 hover:text-white/90'
                                    }`}
                                  >
                                    <sub.icon className="h-3 w-3 shrink-0" />
                                    {sub.label}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/50 transition-colors hover:bg-white/5 hover:text-white"
        >
          ← Public website
        </Link>
        <button
          type="button"
          onClick={handleAdminLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/50 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6f4]">
      <div className="hidden shrink-0 lg:block"><Sidebar /></div>
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#1a2e1f] px-4 py-3 text-white lg:hidden">
          <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-1.5 hover:bg-white/10">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-heading text-sm font-bold">{BRAND_NAME} Admin</span>
          <div className="w-8" />
        </div>
        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}
