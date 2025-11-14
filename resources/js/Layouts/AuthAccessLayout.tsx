import { PropsWithChildren } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ModalProvider } from '@/Context/ModalContext';
import NavigationBar from '@/Components/Navigation/NavigationBar';
import Footer from '@/Components/Footer/Footer';

export default function AuthAccessLayout({ children }: PropsWithChildren) {
    return (
        <ModalProvider>
            <div className="auth-access-layout">
                <NavigationBar />
                <main className="auth-access-content">
                    {children}
                </main>
                <Footer />
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
