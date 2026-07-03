import App from '@/CmsrApp.jsx';

/**
 * Single Inertia root — preserves the full React Router app unchanged
 * so every page, layout, and Supabase integration behaves exactly as before.
 */
export default function Root() {
    return <App />;
}
