/// <reference types="vite/client" />

import './bootstrap';
import '../css/app.css';
import '../css/variables.css';
import '../css/onboarding.css';
import '../css/connections.css';
import '../css/profile.css';
import '../css/family-tree.css';
import '../css/child-accounts.css';
import '../css/status-management.css';
import '../css/notifications.css';
import '../css/stories.css';
import '../css/search.css';
import '../css/settings.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'FamTree';

// Global state for access denied modal
(window as any).profileAccessDeniedState = {
    show: false,
    userName: ''
};

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// Global error handling for profile access denied (403)
router.on('error', (error) => {
    if (error.status === 403 && window.location.pathname.includes('/profile/')) {
        // Trigger modal on the current page
        window.dispatchEvent(new CustomEvent('profileAccessDenied', {
            detail: {
                status: 403,
                message: error.message
            }
        }));
    }
});

