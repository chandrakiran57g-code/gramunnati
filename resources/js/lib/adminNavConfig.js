import {
  LayoutDashboard, Navigation, FileText, Users, BookOpen, Building2, Image,
  Layers, DollarSign, Receipt, MessageSquare, UserPlus, Quote, Newspaper,
  BarChart3, Settings, Heart, LayoutTemplate, HelpCircle,
} from 'lucide-react';
import { adminRoutes } from '@/lib/adminRoutes';

/** New admin sidebar — matches redesigned structure */
export const adminSidebarSections = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: adminRoutes.dashboard,
    exact: true,
  },
  {
    label: 'Navbar Manager',
    icon: Navigation,
    color: 'text-sky-400',
    children: [
      { label: 'About Us', icon: FileText, path: adminRoutes.aboutUs },
      { label: 'Teams', icon: Users, path: adminRoutes.teams },
      { label: 'Member List', icon: Users, path: adminRoutes.memberDirectory },
      { label: 'What We Do', icon: BookOpen, path: adminRoutes.programs },
      { label: 'Partner Organisations', icon: Building2, path: adminRoutes.partners },
      { label: 'Gallery', icon: Image, path: adminRoutes.gallery },
    ],
  },
  {
    label: 'Active Works',
    icon: Layers,
    color: 'text-emerald-400',
    children: [
      { label: 'Templates', icon: LayoutTemplate, path: adminRoutes.activeWorksTemplates },
      { label: 'Cards', icon: Layers, path: adminRoutes.activeWorksCards },
      { label: 'Detail Pages', icon: FileText, path: adminRoutes.activeWorksPages },
    ],
  },
  {
    label: 'Need Support',
    icon: Heart,
    path: adminRoutes.needSupport,
    color: 'text-orange-400',
  },
  {
    label: 'Donations',
    icon: DollarSign,
    color: 'text-amber-400',
    children: [
      { label: 'All Donations', icon: DollarSign, path: adminRoutes.donations },
      { label: 'Receipts', icon: Receipt, path: adminRoutes.receipts },
    ],
  },
  {
    label: 'Communication',
    icon: MessageSquare,
    path: adminRoutes.messages,
  },
  {
    label: 'Volunteers',
    icon: UserPlus,
    path: adminRoutes.volunteers,
  },
  {
    label: 'Stories & News',
    icon: Quote,
    color: 'text-violet-400',
    children: [
      { label: 'Success Stories', icon: Quote, path: adminRoutes.stories },
      { label: 'News', icon: Newspaper, path: adminRoutes.news },
      { label: 'FAQs', icon: HelpCircle, path: adminRoutes.faqs },
    ],
  },
  {
    label: 'Reports',
    icon: BarChart3,
    path: adminRoutes.reports,
  },
  {
    label: 'Settings',
    icon: Settings,
    path: adminRoutes.settings,
  },
];
