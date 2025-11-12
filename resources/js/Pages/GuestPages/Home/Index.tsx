import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';
import HeroSection from './sections/HeroSection';
import MissionSection from './sections/MissionSection';
import HowItWorksSection from './sections/HowItWorksSection';
import FeaturesGridSection from './sections/FeaturesGridSection';
import TestimonialsSection from './sections/TestimonialsSection';
import CTAFooterSection from './sections/CTAFooterSection';

export default function Home() {
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'FamTree',
        'url': 'https://famtree.com',
        'description': 'FamTree - Reconnecting Generations, Preserving Family Roots. Build your digital family tree, preserve your heritage, and connect with relatives worldwide.',
        'sameAs': [
            'https://twitter.com/famtreeapp',
            'https://facebook.com/famtreeapp',
            'https://instagram.com/famtreeapp',
            'https://linkedin.com/company/famtree'
        ]
    };

    return (
        <GuestLayout>
            <Head
                title="FamTree - Reconnecting Generations, Preserving Family Roots"
                meta={[
                    {
                        name: 'description',
                        content: 'Connect with thousands of families, build your digital family tree, and preserve your heritage on FamTree. Discover relatives, share stories, and keep family legacies alive.',
                    },
                    {
                        name: 'keywords',
                        content: 'family tree, genealogy, heritage preservation, Nigerian families, family connections, digital family tree',
                    },
                    {
                        property: 'og:title',
                        content: 'FamTree - Reconnecting Generations, Preserving Family Roots',
                    },
                    {
                        property: 'og:description',
                        content: 'Build your digital family tree and connect with thousands of families preserving their heritage.',
                    },
                    {
                        property: 'og:type',
                        content: 'website',
                    },
                    {
                        property: 'og:url',
                        content: 'https://famtree.com',
                    },
                    {
                        property: 'og:image',
                        content: 'https://famtree.com/og-image-home.jpg',
                    },
                    {
                        name: 'twitter:card',
                        content: 'summary_large_image',
                    },
                    {
                        name: 'twitter:title',
                        content: 'FamTree - Reconnecting Generations, Preserving Family Roots',
                    },
                    {
                        name: 'twitter:description',
                        content: 'Build your digital family tree and connect with thousands of families.',
                    },
                    {
                        name: 'twitter:image',
                        content: 'https://famtree.com/og-image-home.jpg',
                    },
                    {
                        name: 'canonical',
                        content: 'https://famtree.com',
                    },
                ]}
            >
                <script type="application/ld+json">
                    {JSON.stringify(organizationSchema)}
                </script>
            </Head>
            <HeroSection />
            <MissionSection />
            <HowItWorksSection />
            <FeaturesGridSection />
            <TestimonialsSection />
            <CTAFooterSection />
        </GuestLayout>
    );
}
