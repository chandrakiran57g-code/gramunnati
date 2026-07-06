import { Navigate } from 'react-router-dom';

/** Legacy static team page — real team data lives at /teams (managed in admin). */
export default function OurTeam() {
  return <Navigate to="/teams" replace />;
}
