import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Globe, Navigation, FileText, Layout, Users, Building2, Heart, Image,
  UserCheck, UserPlus, MapPin, School, Briefcase, FolderOpen, BarChart3, DollarSign,
  Receipt, BookOpen, Newspaper, Calendar, Quote, MessageSquare, Bell, Settings, Menu,
  ChevronDown, PieChart, Shield, LogOut, ScrollText, Database,
} from 'lucide-react';
import { clearAdminSession } from '@/lib/adminAuth';
import { adminRoutes } from '@/lib/adminRoutes';
import { BRAND_LOGO_URL, BRAND_NAME } from '@/lib/brand';

const sidebarSections = [
  { label: 'Dashboard', icon: LayoutDashboard, path: adminRoutes.dashboard, exact: true },
  {
    label: 'Website Management',
    icon: Globe,
    color: 'text-sky-400',
    children: [
      { label: 'Navigation Manager', icon: Navigation, path: adminRoutes.navigation },
      { label: 'About Us Pages', icon: FileText, path: adminRoutes.pages },
      { label: 'Member List', icon: Users, path: adminRoutes.memberDirectory },
      { label: 'Homepage', icon: Layout, path: adminRoutes.homepage },
      { label: 'Teams', icon: Users, path: adminRoutes.teams },
      { label: 'Partners', icon: Building2, path: adminRoutes.partners },
      { label: 'Gallery', icon: Image, path: adminRoutes.gallery },
    ],
  },
  {
    label: 'Programs & Content',
    icon: BookOpen,
    color: 'text-amber-400',
    children: [
      { label: 'Programs', icon: BookOpen, path: adminRoutes.programs },
      { label: 'Success Stories', icon: Quote, path: adminRoutes.stories },
      { label: 'News', icon: Newspaper, path: adminRoutes.news },
      { label: 'Events', icon: Calendar, path: adminRoutes.events },
    ],
  },
  {
    label: 'Villages & Schools',
    icon: MapPin,
    color: 'text-primary',
    children: [
      { label: 'Villages', icon: MapPin, path: adminRoutes.villages },
      { label: 'Village Activities', icon: BarChart3, path: adminRoutes.villageActivities },
      { label: 'Village Donations', icon: Heart, path: adminRoutes.villageDonations },
      { label: 'Schools', icon: School, path: adminRoutes.schools },
      { label: 'School Activities', icon: BarChart3, path: adminRoutes.schoolActivities },
      { label: 'School Donations', icon: Heart, path: adminRoutes.schoolDonations },
    ],
  },
  {
    label: 'Projects & Impact',
    icon: Briefcase,
    color: 'text-projects',
    children: [
      { label: 'Projects', icon: Briefcase, path: adminRoutes.projects },
      { label: 'Project Categories', icon: FolderOpen, path: adminRoutes.projectCategories },
      { label: 'Impact Metrics', icon: PieChart, path: adminRoutes.impactMetrics },
      { label: 'Beneficiaries', icon: Heart, path: adminRoutes.beneficiaries },
    ],
  },
  {
    label: 'Donations',
    icon: DollarSign,
    color: 'text-donation',
    children: [
      { label: 'All Donations', icon: DollarSign, path: adminRoutes.donations },
      { label: 'Receipts', icon: Receipt, path: adminRoutes.receipts },
    ],
  },
  {
    label: 'People',
    icon: UserCheck,
    color: 'text-emerald-400',
    children: [
      { label: 'Members', icon: UserCheck, path: adminRoutes.users },
      { label: 'Member Directory', icon: Users, path: adminRoutes.memberDirectory },
      { label: 'Volunteers', icon: UserPlus, path: adminRoutes.volunteers },
    ],
  },
  {
    label: 'Communication',
    icon: MessageSquare,
    color: 'text-cyan-400',
    children: [
      { label: 'Contact Messages', icon: MessageSquare, path: adminRoutes.messages },
      { label: 'Notifications', icon: Bell, path: adminRoutes.notifications },
    ],
  },
  { label: 'Reports', icon: BarChart3, path: adminRoutes.reports },
  {
    label: 'System',
    icon: Settings,
    color: 'text-brown-300',
    children: [
      { label: 'Settings', icon: Settings, path: adminRoutes.settings },
      { label: 'Roles & Permissions', icon: Shield, path: adminRoutes.roles },
      { label: 'Audit Logs', icon: ScrollText, path: adminRoutes.auditLogs },
      { label: 'Backup & Maintenance', icon: Database, path: adminRoutes.backup },
    ],
  },
];

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

  useEffect(() => {
    sidebarSections.forEach((section) => {
      if (section.children?.some((child) => isActive(child.path))) {
        setExpandedSections((prev) => ({ ...prev, [section.label]: true }));
      }
    });
  }, [location.pathname]);

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-[#1a2e1f] text-white w-64 border-r border-white/5">
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <img src={BRAND_LOGO_URL} alt={BRAND_NAME} className="w-9 h-9 rounded-full object-contain bg-white/10" />
        <div>
          <div className="font-heading font-bold text-sm">{BRAND_NAME}</div>
          <div className="text-[11px] text-white/50">Admin Control Room</div>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {sidebarSections.map((section) => {
          if (!section.children) {
            return (
              <Link
                key={section.path}
                to={section.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(section.path, section.exact)
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <section.icon className="w-4 h-4 flex-shrink-0" />
                {section.label}
              </Link>
            );
          }

          const isExpanded = expandedSections[section.label];
          const anyChildActive = section.children.some((child) => isActive(child.path));

          return (
            <div key={section.label}>
              <button
                type="button"
                onClick={() => toggleSection(section.label)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  anyChildActive ? 'text-white bg-white/10' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <section.icon className={`w-4 h-4 flex-shrink-0 ${section.color || ''}`} />
                <span className="flex-1 text-left text-xs uppercase tracking-wider">{section.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden ml-4 space-y-0.5 mt-0.5 mb-1 border-l border-white/10"
                  >
                    {section.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2.5 pl-3 pr-3 py-1.5 rounded-r-lg text-[13px] transition-all ${
                          isActive(child.path)
                            ? 'bg-primary/25 text-white font-medium'
                            : 'text-white/50 hover:bg-white/5 hover:text-white/90'
                        }`}
                      >
                        <child.icon className="w-3.5 h-3.5 flex-shrink-0" />
                        {child.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/50 transition-colors hover:bg-white/5 hover:text-white">
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
      <div className="hidden lg:block flex-shrink-0"><Sidebar /></div>
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }} transition={{ duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"><Sidebar /></motion.div>
          </>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden bg-[#1a2e1f] text-white px-4 py-3 flex items-center justify-between border-b border-white/10">
          <button type="button" onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-white/10"><Menu className="w-5 h-5" /></button>
          <span className="font-heading font-bold text-sm">{BRAND_NAME} Admin</span>
          <div className="w-8" />
        </div>
        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}
