import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/i18n/LanguageContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import SplashGate from '@/components/splash/SplashGate';

// Layout
import PublicLayout from '@/components/layout/PublicLayout';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminLayout from '@/pages/admin/AdminLayout';

// Auth Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Public Pages
import Home from '@/pages/Home';
import ProjectDetail from '@/pages/ProjectDetail';
import NewsDetail from '@/pages/NewsDetail';
import EventDetail from '@/pages/EventDetail';
import Compare from '@/pages/Compare';
import About from '@/pages/About';
import Villages from '@/pages/Villages';
import VillageDetail from '@/pages/VillageDetail';
import Schools from '@/pages/Schools';
import SchoolDetail from '@/pages/SchoolDetail';
import Projects from '@/pages/Projects';
import Programs from '@/pages/Programs';
import ProgramDetail from '@/pages/ProgramDetail';
import Impact from '@/pages/Impact';
import Gallery from '@/pages/Gallery';
import Donate from '@/pages/Donate';
import Volunteer from '@/pages/Volunteer';
import Contact from '@/pages/Contact';
import Stories from '@/pages/Stories';
import StoryDetail from '@/pages/StoryDetail';
import SearchPage from '@/pages/Search';
import News from '@/pages/News';
import Events from '@/pages/Events';
import FAQs from '@/pages/FAQs';
import OurTeam from '@/pages/OurTeam';
import Vision from '@/pages/Vision';

// CMS-driven dynamic pages
import CmsPageView from '@/pages/CmsPageView';
import Teams from '@/pages/Teams';
import TeamDetail from '@/pages/TeamDetail';
import PartnersPage from '@/pages/Partners';
import PartnerDetail from '@/pages/PartnerDetail';
import Beneficiaries from '@/pages/Beneficiaries';
import BeneficiaryDetail from '@/pages/BeneficiaryDetail';
import MemberDirectory from '@/pages/MemberDirectory';

// Member Portal
import MemberDashboard from '@/pages/dashboard/MemberDashboard';
import Profile from '@/pages/dashboard/Profile';
import ProfileEdit from '@/pages/dashboard/ProfileEdit';
import MyDonations from '@/pages/dashboard/MyDonations';
import MyVillages from '@/pages/dashboard/MyVillages';
import MySchools from '@/pages/dashboard/MySchools';
import VolunteerProfile from '@/pages/dashboard/VolunteerProfile';
import MyActivities from '@/pages/dashboard/MyActivities';
import Notifications from '@/pages/dashboard/Notifications';
import Settings from '@/pages/dashboard/Settings';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminReports from '@/pages/admin/AdminReports';
import AdminVillages from '@/pages/admin/AdminVillages';
import AdminSchools from '@/pages/admin/AdminSchools';
import AdminProjects from '@/pages/admin/AdminProjects';
import AdminDonations from '@/pages/admin/AdminDonations';
import AdminVolunteers from '@/pages/admin/AdminVolunteers';
import AdminMessages from '@/pages/admin/AdminMessages';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminCMS from '@/pages/admin/AdminCMS';
import AdminNavigation from '@/pages/admin/AdminNavigation';
import AdminCmsPages from '@/pages/admin/AdminCmsPages';
import AdminTeams from '@/pages/admin/AdminTeams';
import AdminPartners from '@/pages/admin/AdminPartners';
import AdminHomepage from '@/pages/admin/AdminHomepage';
import AdminBeneficiaries from '@/pages/admin/AdminBeneficiaries';
import AdminPrograms from '@/pages/admin/AdminPrograms';
import AdminStories from '@/pages/admin/AdminStories';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminNews from '@/pages/admin/AdminNews';
import AdminFaqs from '@/pages/admin/AdminFaqs';
import AdminGallery from '@/pages/admin/AdminGallery';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminMemberDirectory from '@/pages/admin/AdminMemberDirectory';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import AdminRoles from '@/pages/admin/AdminRoles';
import AdminAuditLogs from '@/pages/admin/AdminAuditLogs';
import AdminProjectCategories from '@/pages/admin/AdminProjectCategories';
import AdminImpactMetrics from '@/pages/admin/AdminImpactMetrics';
import AdminReceipts from '@/pages/admin/AdminReceipts';
import AdminVillageActivities from '@/pages/admin/AdminVillageActivities';
import AdminSchoolActivities from '@/pages/admin/AdminSchoolActivities';
import AdminVillageDonations from '@/pages/admin/AdminVillageDonations';
import AdminSchoolDonations from '@/pages/admin/AdminSchoolDonations';
import AdminBackup from '@/pages/admin/AdminBackup';
import ActiveWorkDetail from '@/pages/ActiveWorkDetail';
import ActiveWorksCategory from '@/pages/ActiveWorksCategory';
import NeedSupport from '@/pages/NeedSupport';
import AdminActiveWorksCards from '@/pages/admin/AdminActiveWorksCards';
import AdminActiveWorksPages from '@/pages/admin/AdminActiveWorksPages';
import AdminActiveWorksTemplates from '@/pages/admin/AdminActiveWorksTemplates';
import AdminNeedSupport from '@/pages/admin/AdminNeedSupport';
import AdminLegacyRedirect, { adminLegacyRedirects } from '@/pages/admin/AdminLegacyRedirect';
import { adminRoutes } from '@/lib/adminRoutes';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading CMSR Platform...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Auth Routes (no layout needed) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Public Routes with Layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/about/model-village" element={<About />} />
        <Route path="/about/model-school" element={<About />} />
        <Route path="/vision" element={<Vision />} />
        <Route path="/mission" element={<Vision />} />
        <Route path="/objectives" element={<Vision />} />
        <Route path="/our-team" element={<OurTeam />} />
        <Route path="/advisory-board" element={<OurTeam />} />
        <Route path="/villages" element={<Villages />} />
        <Route path="/villages/:slug" element={<VillageDetail />} />
        <Route path="/schools" element={<Schools />} />
        <Route path="/schools/:slug" element={<SchoolDetail />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/programs/:slug" element={<ProgramDetail />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/stories/:slug" element={<StoryDetail />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:slug" element={<EventDetail />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/compare" element={<Compare />} />

        {/* CMS Dynamic Pages */}
        <Route path="/page/:slug" element={<CmsPageView />} />
        <Route path="/active-works/category/:slug" element={<ActiveWorksCategory />} />
        <Route path="/need-support" element={<NeedSupport />} />
        <Route path="/active-work/:slug" element={<ActiveWorkDetail />} />

        {/* Teams */}
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:slug" element={<TeamDetail />} />

        {/* Partners */}
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/partners/:slug" element={<PartnerDetail />} />

        {/* Beneficiaries */}
        <Route path="/beneficiaries" element={<Beneficiaries />} />
        <Route path="/beneficiaries/:slug" element={<BeneficiaryDetail />} />

        {/* Member Directory */}
        <Route path="/members" element={<MemberDirectory />} />
      </Route>

      {/* Protected Member Portal */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<PublicLayout />}>
          <Route path="/dashboard" element={<MemberDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/my-donations" element={<MyDonations />} />
          <Route path="/my-receipts" element={<MyDonations />} />
          <Route path="/my-villages" element={<MyVillages />} />
          <Route path="/my-schools" element={<MySchools />} />
          <Route path="/volunteer-profile" element={<VolunteerProfile />} />
          <Route path="/my-activities" element={<MyActivities />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Admin login — credentials only */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin panel at /admin */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />

          {/* Navbar Manager */}
          <Route path="nav/about-us" element={<AdminCmsPages />} />
          <Route path="nav/teams" element={<AdminTeams />} />
          <Route path="nav/member-list" element={<AdminMemberDirectory />} />
          <Route path="nav/programs" element={<AdminPrograms />} />
          <Route path="nav/partners" element={<AdminPartners />} />
          <Route path="nav/gallery" element={<AdminGallery />} />

          {/* Active Works */}
          <Route path="active-works/templates" element={<AdminActiveWorksTemplates />} />
          <Route path="active-works/cards" element={<AdminActiveWorksCards />} />
          <Route path="active-works/pages" element={<AdminActiveWorksPages />} />
          <Route path="need-support" element={<AdminNeedSupport />} />

          {/* Donations */}
          <Route path="donations" element={<AdminDonations />} />
          <Route path="receipts" element={<AdminReceipts />} />

          {/* Communication & Volunteers */}
          <Route path="communication" element={<AdminMessages />} />
          <Route path="volunteers" element={<AdminVolunteers />} />

          {/* Stories & News */}
          <Route path="stories" element={<AdminStories />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="faqs" element={<AdminFaqs />} />

          {/* Reports & Settings */}
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />

          {/* Legacy redirects */}
          {Object.entries(adminLegacyRedirects).map(([from, to]) => (
            <Route key={from} path={from.replace('/admin/', '')} element={<AdminLegacyRedirect to={to} />} />
          ))}
          <Route path="messages" element={<AdminLegacyRedirect to={adminRoutes.messages} />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <SplashGate>
              <AuthenticatedApp />
            </SplashGate>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App