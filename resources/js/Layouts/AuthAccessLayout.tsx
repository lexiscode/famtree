import { PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
import { TreePine } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ModalProvider } from '@/Context/ModalContext';
import './AuthAccessLayout.css';

export default function AuthAccessLayout({ children }: PropsWithChildren) {
    return (
        <ModalProvider>
            <div className="auth-access-layout">
                {/* Fixed Header with Logo */}
                <header className="auth-access-header">
                    <div className="auth-access-header-container">
                        <Link href="/" className="auth-access-logo">
                            <div className="auth-access-logo-icon">
                                <TreePine size={28} />
                            </div>
                            <span className="auth-access-logo-text">FamTree</span>
                        </Link>
                    </div>
                </header>

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
