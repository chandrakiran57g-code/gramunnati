import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Globe, Navigation, FileText, Layout, Users, Building2, Heart, Image, Phone,
  UserCheck, UserPlus, MapPin, School, Briefcase, FolderOpen, BarChart3, DollarSign,
  Receipt, BookOpen, Newspaper, Calendar, Quote, MessageSquare, Bell, Settings, Menu, X,
  ChevronDown, PieChart, Shield, LogOut
} from 'lucide-react';

const LOGO_URL = "https://media.base44.com/images/public/user_6a19a4df98ac03e9b75a9132/71b2ecb8f_Screenshot2026-06-10200544.png";

const sidebarSections = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/administrator',
    exact: true,
  },
  {
    label: 'Website Management',
    icon: Globe,
    color: 'text-sky-400',
    children: [
      { label: 'Navigation Manager', icon: Navigation, path: '/administrator/navigation' },
      { label: 'CMS Pages', icon: FileText, path: '/administrator/pages' },
      { label: 'Homepage Manager', icon: Layout, path: '/administrator/homepage' },
      { label: 'Teams', icon: Users, path: '/administrator/teams' },
      { label: 'Partner Organizations', icon: Building2, path: '/administrator/partners' },
      { label: 'Beneficiaries', icon: Heart, path: '/administrator/beneficiaries' },
      { label: 'Gallery', icon: Image, path: '/administrator/gallery' },
      { label: 'Contact Information', icon: Phone, path: '/administrator/messages' },
    ],
  },
  {
    label: 'Community Management',
    icon: UserCheck,
    color: 'text-emerald-400',
    children: [
      { label: 'Users', icon: UserCheck, path: '/administrator/users' },
      { label: 'Member Directory', icon: Users, path: '/administrator/member-directory' },
      { label: 'Volunteers', icon: UserPlus, path: '/administrator/volunteers' },
    ],
  },
  {
    label: 'Village Management',
    icon: MapPin,
    color: 'text-village',
    children: [
      { label: 'Villages', icon: MapPin, path: '/administrator/villages' },
      { label: 'Village Activities', icon: BarChart3, path: '/administrator/village-activities' },
      { label: 'Village Donations', icon: Heart, path: '/administrator/village-donations' },
    ],
  },
  {
    label: 'School Management',
    icon: School,
    color: 'text-school',
    children: [
      { label: 'Schools', icon: School, path: '/administrator/schools' },
      { label: 'School Activities', icon: BarChart3, path: '/administrator/school-activities' },
      { label: 'School Donations', icon: Heart, path: '/administrator/school-donations' },
    ],
  },
  {
    label: 'Project Management',
    icon: Briefcase,
    color: 'text-projects',
    children: [
      { label: 'Projects', icon: Briefcase, path: '/administrator/projects' },
      { label: 'Project Categories', icon: FolderOpen, path: '/administrator/project-categories' },
      { label: 'Impact Metrics', icon: PieChart, path: '/administrator/impact-metrics' },
    ],
  },
  {
    label: 'Donation Management',
    icon: DollarSign,
    color: 'text-donation',
    children: [
      { label: 'Donations', icon: DollarSign, path: '/administrator/donations' },
      { label: 'Receipts', icon: Receipt, path: '/administrator/receipts' },
    ],
  },
  {
    label: 'Programs & Activities',
    icon: BookOpen,
    color: 'text-amber-400',
    children: [
      { label: 'Programs', icon: BookOpen, path: '/administrator/programs' },
      { label: 'Success Stories', icon: Quote, path: '/administrator/stories' },
      { label: 'Events', icon: Calendar, path: '/administrator/events' },
      { label: 'News', icon: Newspaper, path: '/administrator/news' },
    ],
  },
  {
    label: 'Communication Center',
    icon: MessageSquare,
    color: 'text-cyan-400',
    children: [
      { label: 'Contact Messages', icon: MessageSquare, path: '/administrator/messages' },
      { label: 'Notifications', icon: Bell, path: '/administrator/notifications' },
    ],
  },
  {
    label: 'Reports & Analytics',
    icon: BarChart3,
    path: '/administrator/reports',
  },
  {
    label: 'System Settings',
    icon: Settings,
    path: '/administrator/settings',
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const location = useLocation();

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleSection = (label) => {
    setExpandedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Auto-expand sidebar section if a child route is active
  useEffect(() => {
    sidebarSections.forEach(section => {
      if (section.children) {
        const anyChildActive = section.children.some(child => isActive(child.path));
        if (anyChildActive) {
          setExpandedSections(prev => ({ ...prev, [section.label]: true }));
        }
      }
    });
  }, [location.pathname]);

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-gray-900 text-white w-64">
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        <img src={LOGO_URL} alt="GramUnnati" className="w-9 h-9 rounded-full object-contain" />
        <div>
          <div className="font-heading font-bold text-sm">GramUnnati Admin</div>
          <div className="text-[11px] text-gray-400">Management Panel</div>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {sidebarSections.map((section) => {
          if (!section.children) {
            return (
              <Link key={section.path} to={section.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(section.path, section.exact)
                    ? 'bg-village text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}>
                <section.icon className="w-4 h-4 flex-shrink-0" />
                {section.label}
              </Link>
            );
          }

          const isExpanded = expandedSections[section.label];
          const anyChildActive = section.children.some(child => isActive(child.path));

          return (
            <div key={section.label}>
              <button
                onClick={() => toggleSection(section.label)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  anyChildActive ? 'text-white bg-gray-800/60' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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
                    className="overflow-hidden ml-6 space-y-0.5 mt-0.5 mb-1 border-l border-gray-700"
                  >
                    {section.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2.5 pl-3 pr-3 py-1.5 rounded-r-lg text-[13px] transition-all ${
                          isActive(child.path)
                            ? 'bg-village/20 text-white font-medium'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
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
      <div className="p-3 border-t border-gray-800">
        <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          ← Back to Public Site
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
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
        <div className="lg:hidden bg-gray-900 text-white px-4 py-3 flex items-center justify-between border-b border-gray-800">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-800"><Menu className="w-5 h-5" /></button>
          <span className="font-heading font-bold text-sm">GramUnnati Admin</span>
          <div className="w-8" />
        </div>
        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}