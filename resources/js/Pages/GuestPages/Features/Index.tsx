import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

export default function Features() {
    return (
        <GuestLayout>
            <Head title="Features - FamTree" />
            <div style={{ padding: '40px 20px' }}>
                <h1>Features</h1>
                <p>This is a placeholder for the features page.</p>
            </div>
        </GuestLayout>
    );
}
