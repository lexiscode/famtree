import { PropsWithChildren } from 'react';
import { useModal } from '@/Context/ModalContext';
import NavigationBar from '@/Components/Navigation/NavigationBar';
import Footer from '@/Components/Footer/Footer';
import CTAModal from '@/Components/Modal/CTAModal';

interface GuestLayoutContentProps extends PropsWithChildren {
    hideFooter?: boolean;
    hideNavigation?: boolean;
}

export default function GuestLayoutContent({ children, hideFooter = false, hideNavigation = false }: GuestLayoutContentProps) {
    const { isCtaModalOpen, ctaModalTab, closeCtaModal } = useModal();

    return (
        <div className="guest-layout">
            {!hideNavigation && <NavigationBar />}
            <main className="guest-main-content" style={{ marginTop: hideNavigation ? '0' : '80px' }}>
                {children}
            </main>
            {!hideFooter && <Footer />}
            <CTAModal
                isOpen={isCtaModalOpen}
                onClose={closeCtaModal}
                initialTab={ctaModalTab}
            />
        </div>
    );
}
