import { PropsWithChildren } from 'react';
import { useModal } from '@/Context/ModalContext';
import NavigationBar from '@/Components/Navigation/NavigationBar';
import Footer from '@/Components/Footer/Footer';
import CTAModal from '@/Components/Modal/CTAModal';

export default function GuestLayoutContent({ children }: PropsWithChildren) {
    const { isCtaModalOpen, ctaModalTab, closeCtaModal } = useModal();

    return (
        <div className="guest-layout">
            <NavigationBar />
            <main className="guest-main-content" style={{ marginTop: '80px' }}>
                {children}
            </main>
            <Footer />
            <CTAModal
                isOpen={isCtaModalOpen}
                onClose={closeCtaModal}
                initialTab={ctaModalTab}
            />
        </div>
    );
}
