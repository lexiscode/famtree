import { PropsWithChildren, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { TreePine } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ModalProvider } from '@/Context/ModalContext';
import axios from 'axios';
import './AuthAccessLayout.css';

export default function AuthAccessLayout({ children }: PropsWithChildren) {
    const { auth } = usePage().props as { auth?: { user?: { id: number } } };
    const currentUserId = auth?.user?.id;
    const hasMarkedDelivered = useRef(false);

    // Mark all undelivered messages as delivered when user loads any authenticated page
    // This handles the case where user logs in and messages should show as "delivered"
    useEffect(() => {
        if (!currentUserId || hasMarkedDelivered.current) return;

        // Call once per session to mark all pending messages as delivered
        hasMarkedDelivered.current = true;
        axios.post('/messages/mark-all-delivered').catch(() => {
            // Silently fail - endpoint might not exist or user has no messages
        });
    }, [currentUserId]);

    return (
        <ModalProvider>
            <div className="auth-access-layout">
                {/* Floating Home Logo - Top Left */}
                <a href="/" className="auth-floating-home-logo" title="Go to Home">
                    <TreePine size={24} />
                </a>

                <main className="auth-access-content">
                    {children}
                </main>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={true}
                    newestOnTop
                    closeOnClick
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
            </div>
        </ModalProvider>
    );
}
