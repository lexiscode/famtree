import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

export default function Contact() {
    return (
        <GuestLayout>
            <Head title="Contact - FamTree" />
            <div style={{ padding: '40px 20px' }}>
                <h1>Contact Us</h1>
                <p>This is a placeholder for the contact page.</p>
            </div>
        </GuestLayout>
    );
}
