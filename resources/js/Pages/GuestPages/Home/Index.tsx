import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';
import HeroSection from './sections/HeroSection';
import MissionSection from './sections/MissionSection';
import HowItWorksSection from './sections/HowItWorksSection';
import FeaturesGridSection from './sections/FeaturesGridSection';
import TestimonialsSection from './sections/TestimonialsSection';
import CTAFooterSection from './sections/CTAFooterSection';

export default function Home() {
    return (
        <GuestLayout>
            <Head title="Home - FamTree | Preserve Your Family's Legacy" />
            <HeroSection />
            <MissionSection />
            <HowItWorksSection />
            <FeaturesGridSection />
            <TestimonialsSection />
            <CTAFooterSection />
        </GuestLayout>
    );
}
