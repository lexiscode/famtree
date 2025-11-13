import { PropsWithChildren } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ModalProvider } from '@/Context/ModalContext';
import NavigationBar from '@/Components/Navigation/NavigationBar';
import Footer from '@/Components/Footer/Footer';
import GuestLayoutContent from './GuestLayoutContent';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <ModalProvider>
            <GuestLayoutContent>{children}</GuestLayoutContent>
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
