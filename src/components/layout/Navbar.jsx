import { useState, useEffect, useMemo } from 'react';

import { Link, useLocation } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';

import { Menu, X, ChevronDown, Search, Heart, User, LayoutDashboard, LogOut, MapPin, School } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { base44 } from '@/api/base44Client';

import { useLanguage } from '@/i18n/LanguageContext';

import LanguageToggle from '@/components/layout/LanguageToggle';

import { PROGRAMS } from '@/lib/programs';



const LOGO_URL = "https://media.base44.com/images/public/user_6a19a4df98ac03e9b75a9132/71b2ecb8f_Screenshot2026-06-10200544.png";



const FALLBACK_ABOUT_KEYS = [

  { key: 'aboutGramUnnati', path: '/about' },

  { key: 'visionMission', path: '/vision' },

  { key: 'beneficiaries', path: '/beneficiaries' },

  { key: 'aboutVillages', path: '/villages' },

  { key: 'aboutSchools', path: '/schools' },

  { key: 'aboutVolunteers', path: '/volunteer' },

  { key: 'aboutDonations', path: '/donate' },

  { key: 'impactDashboard', path: '/impact' },

  { key: 'successStories', path: '/stories' },

  { key: 'faqs', path: '/faqs' },

];



const FALLBACK_PROGRAM_ITEMS = PROGRAMS.map((p) => ({

  label: p.title,

  path: `/programs/${p.slug}`,

}));



export default function Navbar() {

  const { t } = useLanguage();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState(null);

  const [user, setUser] = useState(null);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const location = useLocation();



  const [cmsPages, setCmsPages] = useState([]);

  const [teamGroups, setTeamGroups] = useState([]);

  const [programs, setPrograms] = useState([]);

  const [programsLoading, setProgramsLoading] = useState(false);



  useEffect(() => {

    base44.auth.me().then(setUser).catch(() => setUser(null));

    base44.entities.CmsPage.filter({ status: 'published' }, 'display_order', 50).then(setCmsPages).catch(() => {});

    base44.entities.TeamGroup.filter({ status: 'active' }, 'display_order', 50).then(setTeamGroups).catch(() => {});

  }, []);



  const handleDropdownEnter = (label) => {

    setActiveDropdown(label);

    if (label === t('nav.whatWeDo') && programs.length === 0 && !programsLoading) {

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



  const aboutChildren = useMemo(() => {

    const cms = cmsPages.length > 0

      ? cmsPages.map((p) => ({ label: p.title, path: `/page/${p.slug}` }))

      : FALLBACK_ABOUT_KEYS.map((item) => ({ label: t(`nav.${item.key}`), path: item.path }));

    return cms;

  }, [cmsPages, t]);



  const programChildren = useMemo(() => {

    if (programs.length > 0) {

      return programs.map((p) => ({ label: p.title, path: `/programs/${p.slug}` }));

    }

    return FALLBACK_PROGRAM_ITEMS;

  }, [programs]);



  const teamChildren = useMemo(() => (

    teamGroups.length > 0

      ? teamGroups.map((g) => ({ label: g.name, path: `/teams/${g.slug}` }))

      : [{ label: t('nav.ourTeam'), path: '/our-team' }]

  ), [teamGroups, t]);



  const navItems = useMemo(() => [

    {

      label: t('nav.aboutUs'),

      path: cmsPages.length > 0 ? `/page/${cmsPages[0].slug}` : '/about',

      children: aboutChildren,

    },

    {

      label: t('nav.teams'),

      path: '/teams',

      children: teamChildren,

    },

    {

      label: t('nav.whatWeDo'),

      path: '/programs',

      children: programChildren,

    },

    { label: t('nav.memberList'), path: '/members' },

    { label: t('nav.partnerOrganization'), path: '/partners' },

    { label: t('nav.gallery'), path: '/gallery' },

    { label: t('nav.contactUs'), path: '/contact' },

  ], [t, cmsPages, aboutChildren, teamChildren, programChildren]);



  const linkClass = (path, active) =>

    `flex items-center gap-1 px-2 py-2 text-[13px] font-medium rounded-md transition-all duration-200 whitespace-nowrap ${

      active

        ? 'text-primary bg-primary/10'

        : 'text-foreground hover:text-primary hover:bg-primary/5'

    }`;



  return (

    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${

      scrolled ? 'bg-cream-50/95 backdrop-blur-md shadow-md border-b border-brown-300' : 'bg-cream-50/90 backdrop-blur-sm'

    }`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="flex items-center justify-between h-16">

          {/* Branding */}

          <Link to="/" className="flex items-center gap-3 flex-shrink-0 mr-2">

            <img src={LOGO_URL} alt="GramUnnati Logo" className="h-10 w-10 object-contain rounded-full" />

            <div className="hidden sm:block">

              <div className="font-heading font-bold text-lg leading-tight text-foreground">GramUnnati</div>

              <div className="text-xs text-muted-foreground leading-tight">{t('brand.tagline')}</div>

            </div>

          </Link>



          <div className="hidden xl:flex items-center gap-0 flex-1 justify-center">

            {navItems.map((item) => (

              <div

                key={item.label}

                className="relative"

                onMouseEnter={() => handleDropdownEnter(item.label)}

                onMouseLeave={() => setActiveDropdown(null)}

              >

                <Link

                  to={item.path}

                  className={linkClass(item.path.replace(/\/page\/.*/, ''), isActive(item.path.replace(/\/page\/.*/, '')))}

                >

                  {item.label}

                  {item.children && item.children.length > 0 && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}

                </Link>



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

                        <Link

                          key={child.path + child.label}

                          to={child.path}

                          className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-colors"

                        >

                          {child.label}

                        </Link>

                      ))}

                    </motion.div>

                  )}

                </AnimatePresence>

              </div>

            ))}



            {/* Donate Us — agriculture gold */}

            <Link to="/donate" className="ml-1">

              <Button size="sm" className="bg-service-agriculture hover:bg-service-agriculture/90 text-white border-0 font-semibold px-4 hover:opacity-95">

                <Heart className="w-3.5 h-3.5 mr-1.5" />

                {t('nav.donateUs')}

              </Button>

            </Link>

          </div>



          {/* Utilities: language, search, auth */}

          <div className="hidden lg:flex items-center gap-1 shrink-0">

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

              onMouseEnter={() => setUserMenuOpen(true)}

              onMouseLeave={() => setUserMenuOpen(false)}

            >

              {user ? (

                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/15 transition-colors text-sm font-medium">

                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">

                    {user.full_name?.charAt(0) || '?'}

                  </div>

                  <ChevronDown className="w-3 h-3 opacity-60" />

                </button>

              ) : (

                <div className="flex items-center gap-1 ml-1">

                  <Link to="/login">

                    <Button size="sm" variant="ghost" className="text-sm">{t('nav.login')}</Button>

                  </Link>

                  <Link to="/register">

                    <Button size="sm" className="brand-gradient text-white border-0 text-sm">{t('nav.register')}</Button>

                  </Link>

                </div>

              )}

              <AnimatePresence>

                {user && userMenuOpen && (

                  <motion.div

                    initial={{ opacity: 0, y: 8 }}

                    animate={{ opacity: 1, y: 0 }}

                    exit={{ opacity: 0, y: 8 }}

                    transition={{ duration: 0.15 }}

                    className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-border overflow-hidden z-50"

                  >

                    <div className="px-4 py-3 border-b border-border">

                      <div className="font-semibold text-sm">{user.full_name}</div>

                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>

                    </div>

                    <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-colors">

                      <User className="w-4 h-4" /> {t('nav.myProfile')}

                    </Link>

                    <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-colors">

                      <LayoutDashboard className="w-4 h-4" /> {t('nav.dashboard')}

                    </Link>

                    <Link to="/my-donations" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-colors">

                      <Heart className="w-4 h-4" /> {t('nav.myDonations')}

                    </Link>

                    <Link to="/my-villages" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-colors">

                      <MapPin className="w-4 h-4" /> {t('nav.myVillages')}

                    </Link>

                    <Link to="/my-schools" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-colors">

                      <School className="w-4 h-4" /> {t('nav.mySchools')}

                    </Link>

                    <Link to="/notifications" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-colors">

                      <Heart className="w-4 h-4" /> {t('nav.notifications')}

                    </Link>

                    {user.role === 'admin' && (

                      <Link to="/administrator" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-colors border-t border-border">

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

          </div>



          <div className="flex lg:hidden items-center gap-2">

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

              {navItems.map((item) => (

                <div key={item.label}>

                  <Link

                    to={item.path}

                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${

                      isActive(item.path) ? 'text-primary bg-primary/10' : 'text-foreground hover:text-primary hover:bg-muted'

                    }`}

                  >

                    {item.label}

                  </Link>

                  {item.children && item.children.length > 0 && (

                    <div className="ml-4 mt-1 space-y-0.5">

                      {item.children.map((child) => (

                        <Link

                          key={child.path + child.label}

                          to={child.path}

                          className="block px-3 py-2 text-xs text-muted-foreground hover:text-primary rounded-md hover:bg-muted transition-colors"

                        >

                          — {child.label}

                        </Link>

                      ))}

                    </div>

                  )}

                </div>

              ))}

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


