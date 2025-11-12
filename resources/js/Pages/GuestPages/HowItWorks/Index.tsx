import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

export default function HowItWorks() {
    return (
        <GuestLayout>
            <Head title="How It Works - FamTree" />
            <div style={{ padding: '40px 20px' }}>
                <h1>How It Works</h1>
                <p>This is a placeholder for the how it works page.</p>
            </div>
        </GuestLayout>
    );
}
