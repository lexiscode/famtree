import { PropsWithChildren } from 'react';
import { TreePine } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ModalProvider } from '@/Context/ModalContext';
import './AuthAccessLayout.css';

export default function AuthAccessLayout({ children }: PropsWithChildren) {
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
