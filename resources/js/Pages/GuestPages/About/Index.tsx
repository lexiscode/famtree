import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

export default function About() {
    return (
        <GuestLayout>
            <Head title="About - FamTree" />
            <div style={{ padding: '40px 20px' }}>
                <h1>About FamTree</h1>
                <p>This is a placeholder for the about page.</p>
            </div>
        </GuestLayout>
    );
}
