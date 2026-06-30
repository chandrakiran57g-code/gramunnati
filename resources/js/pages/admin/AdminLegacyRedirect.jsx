import { Navigate } from 'react-router-dom';
import { adminRoutes } from '@/lib/adminRoutes';

/** Redirect legacy admin URLs to the redesigned routes */
export default function AdminLegacyRedirect({ to }) {
  return <Navigate to={to} replace />;
}

export const adminLegacyRedirects = {
  [adminRoutes.navigation]: adminRoutes.aboutUs,
  [adminRoutes.pages]: adminRoutes.aboutUs,
  [adminRoutes.homepage]: adminRoutes.activeWorksCards,
  [adminRoutes.users]: adminRoutes.memberDirectory,
  [adminRoutes.beneficiaries]: adminRoutes.aboutUs,
  [adminRoutes.events]: adminRoutes.news,
  [adminRoutes.notifications]: adminRoutes.messages,
  [adminRoutes.cms]: adminRoutes.aboutUs,
  [adminRoutes.roles]: adminRoutes.settings,
  [adminRoutes.auditLogs]: adminRoutes.reports,
  [adminRoutes.backup]: adminRoutes.settings,
  [adminRoutes.villages]: adminRoutes.activeWorksPages,
  [adminRoutes.schools]: adminRoutes.activeWorksPages,
  [adminRoutes.projects]: adminRoutes.activeWorksPages,
  [adminRoutes.villageActivities]: adminRoutes.activeWorksPages,
  [adminRoutes.villageDonations]: adminRoutes.donations,
  [adminRoutes.schoolActivities]: adminRoutes.activeWorksPages,
  [adminRoutes.schoolDonations]: adminRoutes.donations,
  [adminRoutes.projectCategories]: adminRoutes.activeWorksPages,
  [adminRoutes.impactMetrics]: adminRoutes.reports,
  [adminRoutes.activeWorks]: adminRoutes.activeWorksCards,
};
