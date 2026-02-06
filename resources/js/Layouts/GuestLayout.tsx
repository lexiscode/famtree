import { PropsWithChildren } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ModalProvider } from '@/Context/ModalContext';
import { useFlashToast } from '@/hooks/useFlashToast';
import GuestLayoutContent from './GuestLayoutContent';

interface GuestLayoutProps extends PropsWithChildren {
    hideFooter?: boolean;
    hideNavigation?: boolean;
}

export default function Guest({ children, hideFooter = false, hideNavigation = false }: GuestLayoutProps) {
    useFlashToast();

    return (
        <ModalProvider>
            <GuestLayoutContent hideFooter={hideFooter} hideNavigation={hideNavigation}>{children}</GuestLayoutContent>
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
        </ModalProvider>
    );
}
