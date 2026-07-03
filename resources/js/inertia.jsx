import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

createInertiaApp({
    title: (title) =>
        title
            ? `${title} — CMSR`
            : 'CMSR — Village Development & School Empowerment Platform',
    resolve: (name) => {
        if (name === 'Root') {
            return import('./pages/Root.jsx');
        }
        throw new Error(`Unknown Inertia page: ${name}`);
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: 'hsl(142 45% 35%)',
    },
});
