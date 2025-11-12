import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

export default function BlogIndex() {
    return (
        <GuestLayout>
            <Head title="Blog - FamTree" />
            <div style={{ padding: '40px 20px' }}>
                <h1>Blog</h1>
                <p>This is a placeholder for the blog index page.</p>
            </div>
        </GuestLayout>
    );
}
