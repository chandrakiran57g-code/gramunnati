import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Search, Heart, User, LayoutDashboard, LogOut, MapPin, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/i18n/LanguageContext';
import LanguageToggle from '@/components/layout/LanguageToggle';
import BrandTagline from '@/components/brand/BrandTagline';
import { usePlatformNavData } from '@/hooks/usePlatformNavData';
import { LOGO_URL } from '@/lib/navFallbacks';
import { usePublicSettings } from '@/hooks/usePublicSettings';
import { localize } from '@/lib/localizedContent';
import { normalizeExternalUrl, isExternalUrl } from '@/lib/externalUrl';

/** Renders <a> for external URLs (YouTube, socials, …) and a router <Link> for internal paths. */
function SmartLink({ to, children, ...props }) {
  if (isExternalUrl(to)) {
    return (
      <a href={normalizeExternalUrl(to)} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }
  return <Link to={to} {...props}>{children}</Link>;
}

export default function Navbar() {

  const { t, lang } = useLanguage();
  const { siteName, siteNameTe, logoUrl } = usePublicSettings();
  const brandName = (lang === 'te' && siteNameTe) ? siteNameTe : siteName;

  const [mobileOpen, setMobileOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState(null);

  const [user, setUser] = useState(null);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [mobileExpanded, setMobileExpanded] = useState(null);
  const dropdownTimer = useRef(null);
  const location = useLocation();



  const { navConfig, aboutPages, teamGroups, programs } = usePlatformNavData();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);



  const clearDropdownTimer = () => {
    if (dropdownTimer.current) {
      clearTimeout(dropdownTimer.current);
      dropdownTimer.current = null;
    }
  };

  const openDropdown = (label) => {
    clearDropdownTimer();
    setActiveDropdown(label);
  };

  const closeDropdown = () => {
    clearDropdownTimer();
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 180);
  };



  useEffect(() => {

    const handleScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);



  useEffect(() => {

    setMobileOpen(false);

    setActiveDropdown(null);

    setMobileExpanded(null);

    clearDropdownTimer();

  }, [location]);



  const isActive = (path) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isNavItemActive = (item) => {
    const path = item.path;
    if (path.startsWith('/page/') || path === '/about') {
      return location.pathname === '/about' || location.pathname.startsWith('/page/');
    }
    return isActive(path);
  };



  const aboutChildren = useMemo(() => {
    // Purely data-driven — only shows CMS pages that exist in DB with status=active
    return aboutPages.map((p) => ({ label: localize(p, 'title', lang), path: `/page/${p.slug}` }));
  }, [aboutPages, lang]);

  const programChildren = useMemo(
    () => programs.map((p) => ({ label: localize(p, 'title', lang), path: `/programs/${p.slug}` })),
    [programs, lang],
  );

  const teamChildren = useMemo(
    () => teamGroups.map((g) => ({ label: localize(g, 'name', lang), path: `/teams/${g.slug}` })),
    [teamGroups, lang],
  );

  const navItems = useMemo(() => {
    const enabled = [...(navConfig.items || [])]
      .filter((item) => item.enabled !== false)
      .sort((a, b) => a.order - b.order);

    return enabled.map((item) => {
      if (item.source === 'cms') {
        return {
          label: item.label,
          path: aboutPages.length > 0 ? `/page/${aboutPages[0].slug}` : '/about',
          children: aboutChildren,
        };
      }
      if (item.source === 'team_groups') {
        return { label: item.label, path: '/teams', children: teamChildren };
      }
      if (item.source === 'programs') {
        return { label: item.label, path: '/programs', children: programChildren };
      }
      return { label: item.label, path: item.path || '/' };
    });
  }, [navConfig, aboutPages, aboutChildren, teamChildren, programChildren]);



  const linkClass = (path, active) =>
    `nav-link-cs flex items-center gap-1 px-1.5 xl:px-2 2xl:px-2.5 py-2 text-[11px] xl:text-xs 2xl:text-[13px] font-semibold whitespace-nowrap shrink-0 ${
      active ? 'nav-link-active text-primary' : 'text-foreground hover:text-primary'
    }`;

  const brandBlock = (
    <>
      <img src={logoUrl || LOGO_URL} alt={`${brandName} Logo`} className="h-9 w-9 xl:h-10 xl:w-10 object-contain rounded-full shrink-0" />
      <div className="hidden lg:block leading-tight min-w-0">
        <div className="font-heading font-bold text-sm xl:text-base text-foreground">{brandName}</div>
        <BrandTagline className="text-[9px] xl:text-[10px] 2xl:text-xs max-w-[10.5rem] xl:max-w-[12rem] 2xl:max-w-[14rem]" />
      </div>
    </>
  );

  const renderNavLinks = () =>
    navItems.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isOpen = activeDropdown === item.label;
      const pathActive = isNavItemActive(item);

      return (
        <div
          key={item.label}
          className="relative shrink-0"
          onMouseEnter={() => hasChildren && openDropdown(item.label)}
          onMouseLeave={closeDropdown}
        >
          <SmartLink
            to={item.path}
            className={linkClass(item.path, pathActive)}
          >
            {item.label}
            {hasChildren && (
              <ChevronDown className={`nav-chevron w-3.5 h-3.5 opacity-70 ${isOpen ? 'nav-chevron-open' : ''}`} />
            )}
          </SmartLink>

          <AnimatePresence>
            {hasChildren && isOpen && (
              <>
                <div className="nav-dropdown-bridge absolute left-0 right-0 top-full h-3 z-50" aria-hidden="true" />
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="nav-dropdown-panel absolute top-full left-0 mt-2 min-w-[260px] bg-white rounded-lg overflow-hidden z-[60] max-h-[70vh] overflow-y-auto"
                  onMouseEnter={clearDropdownTimer}
                  onMouseLeave={closeDropdown}
                >
                  <div className="nav-dropdown-header px-4 py-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                  {item.children.map((child) => (
                    <SmartLink
                      key={child.path + child.label}
                      to={child.path}
                      className="nav-dropdown-item block px-4 py-2.5 text-sm text-foreground"
                    >
                      {child.label}
                    </SmartLink>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      );
    });

  const renderUtilities = () => (
    <>
      <LanguageToggle className="shrink-0" />

      <Link
        to="/search"
        className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
        title={t('nav.search')}
      >
        <Search className="w-4 h-4" />
      </Link>

      <div
        className="relative ml-1"
        onMouseEnter={() => { clearDropdownTimer(); setUserMenuOpen(true); }}
        onMouseLeave={() => {
          clearDropdownTimer();
          dropdownTimer.current = setTimeout(() => setUserMenuOpen(false), 180);
        }}
      >
        {user ? (
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/15 transition-colors text-sm font-medium">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user.full_name?.charAt(0) || '?'}
            </div>
            <ChevronDown className={`nav-chevron w-3 h-3 opacity-70 ${userMenuOpen ? 'nav-chevron-open' : ''}`} />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <Link to="/login">
              <Button size="sm" variant="ghost" className="text-xs h-8 px-2.5">{t('nav.login')}</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="brand-gradient text-white border-0 text-xs h-8 px-2.5">{t('nav.register')}</Button>
            </Link>
          </div>
        )}

        <AnimatePresence>
          {user && userMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="nav-dropdown-panel absolute right-0 top-full mt-2 w-52 bg-white rounded-lg overflow-hidden z-50"
              onMouseEnter={clearDropdownTimer}
              onMouseLeave={() => {
                clearDropdownTimer();
                dropdownTimer.current = setTimeout(() => setUserMenuOpen(false), 180);
              }}
            >
              <div className="px-4 py-3 border-b border-border">
                <div className="font-semibold text-sm">{user.full_name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>

              <Link to="/profile" className="nav-dropdown-item flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground">
                <User className="w-4 h-4" /> {t('nav.myProfile')}
              </Link>

              <Link to="/dashboard" className="nav-dropdown-item flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground">
                <LayoutDashboard className="w-4 h-4" /> {t('nav.dashboard')}
              </Link>

              <Link to="/my-donations" className="nav-dropdown-item flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground">
                <Heart className="w-4 h-4" /> {t('nav.myDonations')}
              </Link>

              <Link to="/my-villages" className="nav-dropdown-item flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground">
                <MapPin className="w-4 h-4" /> {t('nav.myVillages')}
              </Link>

              <Link to="/my-schools" className="nav-dropdown-item flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground">
                <School className="w-4 h-4" /> {t('nav.mySchools')}
              </Link>

              <Link to="/notifications" className="nav-dropdown-item flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground">
                <Heart className="w-4 h-4" /> {t('nav.notifications')}
              </Link>

              {user.role === 'admin' && (
                <Link to="/admin" className="nav-dropdown-item flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground border-t border-border">
                  <LayoutDashboard className="w-4 h-4" /> {t('nav.adminPanel')}
                </Link>
              )}

              <button type="button" onClick={() => base44.auth.logout('/')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-border">
                <LogOut className="w-4 h-4" /> {t('nav.logout')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );

  return (

    <nav className={`fixed top-0 left-0 right-0 z-50 overflow-visible transition-all duration-300 ${

      scrolled ? 'bg-cream-50/95 backdrop-blur-md shadow-md border-b border-brown-300' : 'bg-cream-50/90 backdrop-blur-sm'

    }`}>

      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-5 overflow-visible">

        <div className="flex items-center h-16 w-full flex-nowrap overflow-visible">

          {/* Logo — tablet / mobile and lg-only bar (hidden on xl+ where grid owns branding) */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 xl:hidden">
            {brandBlock}
          </Link>

          {/* Desktop xl+: flex keeps center nav bounded so it never overlaps utilities */}
          <div className="hidden xl:flex w-full items-center min-w-0 gap-2 overflow-visible">
            <Link to="/" className="flex items-center gap-2 shrink-0 min-w-0 max-w-[10.5rem] xl:max-w-[12rem] 2xl:max-w-[15rem]">
              {brandBlock}
            </Link>

            <nav
              className="flex-1 min-w-0 flex items-center justify-center px-1 overflow-visible"
              aria-label="Main navigation"
            >
              <div className="flex items-center shrink-0">
                {renderNavLinks()}
              </div>
            </nav>

            <div className="flex items-center justify-end gap-0.5 shrink-0 pl-1 relative z-10">
              <Link to="/donate" className="shrink-0">
                <Button size="sm" className="bg-service-agriculture hover:bg-service-agriculture/90 text-white border-0 font-semibold px-3 2xl:px-4 text-xs h-8 hover:opacity-95 whitespace-nowrap">
                  <Heart className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  {t('nav.donateUs')}
                </Button>
              </Link>
              {renderUtilities()}
            </div>
          </div>

          {/* Utilities — lg only (nav links in hamburger until xl) */}
          <div className="hidden lg:flex xl:hidden items-center gap-0.5 shrink-0 ml-auto">
            {renderUtilities()}
          </div>

          <div className="flex lg:hidden items-center gap-2 ml-auto shrink-0">

            <LanguageToggle />

            <button

              type="button"

              className="p-2 rounded-md text-foreground hover:bg-muted transition-colors"

              onClick={() => setMobileOpen(!mobileOpen)}

            >

              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}

            </button>

          </div>

        </div>

      </div>



      <AnimatePresence>

        {mobileOpen && (

          <motion.div

            initial={{ opacity: 0, height: 0 }}

            animate={{ opacity: 1, height: 'auto' }}

            exit={{ opacity: 0, height: 0 }}

            className="lg:hidden bg-cream-50 border-t border-border overflow-hidden"

          >

            <div className="px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">

              {navItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = mobileExpanded === item.label;

                return (
                <div key={item.label}>
                  {hasChildren ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setMobileExpanded(isExpanded ? null : item.label)}
                        className={`nav-mobile-toggle w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isNavItemActive(item) ? 'text-primary bg-primary/10' : 'text-foreground hover:text-primary hover:bg-muted'
                        }`}
                      >
                        {item.label}
                        <ChevronDown className={`nav-chevron w-4 h-4 opacity-70 ${isExpanded ? 'nav-chevron-open' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="ml-3 mt-1 mb-1 space-y-0.5 border-l-2 border-primary/20 pl-3">
                              <Link
                                to={item.path}
                                className="nav-dropdown-item block px-3 py-2 text-xs font-semibold text-primary rounded-md"
                              >
                                {t('home.viewAll')}
                              </Link>
                              {item.children.map((child) => (
                                <SmartLink
                                  key={child.path + child.label}
                                  to={child.path}
                                  className="nav-dropdown-item block px-3 py-2 text-xs text-muted-foreground rounded-md"
                                >
                                  {child.label}
                                </SmartLink>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <SmartLink
                      to={item.path}
                      className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isNavItemActive(item) ? 'text-primary bg-primary/10' : 'text-foreground hover:text-primary hover:bg-muted'
                      }`}
                    >
                      {item.label}
                    </SmartLink>
                  )}
                </div>
              );})}

              <Link to="/donate" className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-center bg-service-agriculture text-white mt-2">

                {t('nav.donateUs')}

              </Link>

              <div className="pt-3 border-t border-border flex gap-2">

                <Link to="/search" className="flex-1"><Button variant="outline" className="w-full text-sm">Search</Button></Link>

                {user ? (

                  <Link to="/dashboard" className="flex-1"><Button className="w-full text-sm">Dashboard</Button></Link>

                ) : (

                  <>

                    <Link to="/login" className="flex-1"><Button variant="outline" className="w-full text-sm">{t('nav.login')}</Button></Link>

                    <Link to="/register" className="flex-1"><Button className="w-full brand-gradient text-white border-0 text-sm">{t('nav.register')}</Button></Link>

                  </>

                )}

              </div>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </nav>

  );

}


