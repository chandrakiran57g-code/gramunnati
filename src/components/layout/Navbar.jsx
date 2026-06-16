import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Search, Heart, User, LayoutDashboard, LogOut, MapPin, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const LOGO_URL = "https://media.base44.com/images/public/user_6a19a4df98ac03e9b75a9132/71b2ecb8f_Screenshot2026-06-10200544.png";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  // CMS-driven nav data
  const [cmsPages, setCmsPages] = useState([]);
  const [teamGroups, setTeamGroups] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    // Fetch CMS pages for About Us dropdown
    base44.entities.CmsPage.filter({ status: 'published' }, 'display_order', 50).then(setCmsPages).catch(() => {});
    // Fetch team groups for Teams dropdown
    base44.entities.TeamGroup.filter({ status: 'active' }, 'display_order', 50).then(setTeamGroups).catch(() => {});
  }, []);

  // Lazy-fetch programs on first dropdown hover
  const handleDropdownEnter = (label) => {
    setActiveDropdown(label);
    if ((label === 'What We Do' || label === 'what-we-do') && programs.length === 0 && !programsLoading) {
      setProgramsLoading(true);
      base44.entities.Program.filter({ status: 'active' }, 'sort_order', 50)
        .then(setPrograms).catch(() => {}).finally(() => setProgramsLoading(false));
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Fallback items when CMS data is not yet loaded
  const fallbackAboutPages = [
    { label: 'About GramUnnati', path: '/about' },
    { label: 'Vision & Mission', path: '/vision' },
    { label: 'About Villages', path: '/villages' },
    { label: 'About Schools', path: '/schools' },
    { label: 'About Volunteers', path: '/volunteer' },
    { label: 'About Donations', path: '/donate' },
    { label: 'Impact Dashboard', path: '/impact' },
    { label: 'Success Stories', path: '/stories' },
    { label: 'FAQs', path: '/faqs' },
  ];

  const fallbackTeamGroups = [
    { label: 'Our Team', path: '/our-team' },
  ];

  const fallbackPrograms = [
    { label: 'Village Development', path: '/programs' },
    { label: 'School Empowerment', path: '/programs' },
    { label: 'Projects', path: '/projects' },
    { label: 'Events', path: '/events' },
    { label: 'News & Updates', path: '/news' },
  ];

  // Build nav items with dynamic children (CMS data overrides fallbacks)
  const navItems = [
    {
      label: 'About Us',
      path: cmsPages.length > 0 ? `/page/${cmsPages[0].slug}` : '/about',
      children: cmsPages.length > 0
        ? cmsPages.map(p => ({ label: p.title, path: `/page/${p.slug}` }))
        : fallbackAboutPages,
    },
    {
      label: 'Teams',
      path: '/teams',
      children: teamGroups.length > 0
        ? teamGroups.map(g => ({ label: g.name, path: `/teams/${g.slug}` }))
        : fallbackTeamGroups,
    },
    {
      label: 'What We Do',
      path: '/programs',
      children: programs.length > 0
        ? programs.map(p => ({ label: p.title, path: `/programs/${p.slug}` }))
        : fallbackPrograms,
    },
    { label: 'Partners', path: '/partners' },
    { label: 'Beneficiaries', path: '/beneficiaries' },
    { label: 'Member List', path: '/members' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Donate', path: '/donate', highlight: true },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-border' : 'bg-white/90 backdrop-blur-sm'
    }`}>


      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img src={LOGO_URL} alt="GramUnnati Logo" className="h-10 w-10 object-contain rounded-full" />
            <div className="hidden sm:block">
              <div className="font-heading font-bold text-lg leading-tight text-foreground">GramUnnati</div>
              <div className="text-xs text-muted-foreground leading-tight">Village Development</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0">
            {navItems.map((item) => (
              <div key={item.label} className="relative"
                onMouseEnter={() => handleDropdownEnter(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.highlight ? (
                  <Link to={item.path}>
                    <Button size="sm" className="donation-gradient text-white border-0 font-semibold px-5 ml-2 hover:opacity-90">
                      <Heart className="w-3.5 h-3.5 mr-1.5" />
                      Donate Now
                    </Button>
                  </Link>
                ) : (
                  <Link to={item.path}
                    className={`flex items-center gap-1 px-2 py-2 text-[13px] font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                      isActive(item.path.replace(/\/page\/.*/, ''))
                        ? 'text-village bg-village/8'
                        : 'text-foreground hover:text-village hover:bg-village/5'
                    }`}
                  >
                    {item.label}
                    {item.children && item.children.length > 0 && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
                  </Link>
                )}

                {/* Dropdown */}
                <AnimatePresence>
                  {item.children && item.children.length > 0 && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 min-w-[240px] bg-white rounded-xl shadow-xl border border-border overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
                    >
                      {item.children.map((child) => (
                        <Link key={child.path} to={child.path}
                          className="block px-4 py-2.5 text-sm text-foreground hover:bg-village/5 hover:text-village transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Search */}
            <Link to="/search" className="ml-2 p-2 rounded-md text-muted-foreground hover:text-village hover:bg-village/5 transition-colors" title="Search">
              <Search className="w-4 h-4" />
            </Link>

            {/* User menu */}
            <div className="relative ml-1"
              onMouseEnter={() => setUserMenuOpen(true)}
              onMouseLeave={() => setUserMenuOpen(false)}>
              {user ? (
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-village/8 text-village hover:bg-village/15 transition-colors text-sm font-medium">
                  <div className="w-6 h-6 bg-village rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.full_name?.charAt(0) || '?'}
                  </div>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              ) : (
                <div className="flex items-center gap-1 ml-1">
                  <Link to="/login">
                    <Button size="sm" variant="ghost" className="text-sm">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="village-gradient text-white border-0 text-sm">Register</Button>
                  </Link>
                </div>
              )}
              <AnimatePresence>
                {user && userMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-border overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <div className="font-semibold text-sm">{user.full_name}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    </div>
                    <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-village/5 hover:text-village transition-colors">
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-village/5 hover:text-village transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/my-donations" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-village/5 hover:text-village transition-colors">
                      <Heart className="w-4 h-4" /> My Donations
                    </Link>
                    <Link to="/my-villages" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-village/5 hover:text-village transition-colors">
                      <MapPin className="w-4 h-4" /> My Villages
                    </Link>
                    <Link to="/my-schools" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-village/5 hover:text-village transition-colors">
                      <School className="w-4 h-4" /> My Schools
                    </Link>
                    <Link to="/notifications" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-village/5 hover:text-village transition-colors">
                      <Heart className="w-4 h-4" /> Notifications
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/administrator" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-village/5 hover:text-village transition-colors border-t border-border">
                        <LayoutDashboard className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={() => base44.auth.logout('/')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-border">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden p-2 rounded-md text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-border overflow-hidden">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <div key={item.label}>
                  <Link to={item.path}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      item.highlight ? 'donation-gradient text-white text-center font-semibold' :
                      isActive(item.path) ? 'text-village bg-village/8' : 'text-foreground hover:text-village hover:bg-muted'
                    }`}>
                    {item.label}
                  </Link>
                  {item.children && item.children.length > 0 && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {item.children.slice(0, 6).map((child) => (
                        <Link key={child.path} to={child.path}
                          className="block px-3 py-2 text-xs text-muted-foreground hover:text-village rounded-md hover:bg-muted transition-colors">
                          — {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-3 border-t border-border">
                {user ? (
                  <>
                    <Link to="/dashboard" className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:text-village hover:bg-muted">Dashboard</Link>
                    <Link to="/profile" className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:text-village hover:bg-muted">My Profile</Link>
                    <button onClick={() => base44.auth.logout('/')} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50">Logout</button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="flex-1"><Button variant="outline" className="w-full">Login</Button></Link>
                    <Link to="/register" className="flex-1"><Button className="w-full village-gradient text-white border-0">Register</Button></Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}