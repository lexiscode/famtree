import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

interface Props {
    slug: string;
}

export default function BlogShow({ slug }: Props) {
    return (
        <GuestLayout>
            <Head title={`${slug} - FamTree Blog`} />
            <div style={{ padding: '40px 20px' }}>
                <h1>Blog Post: {slug}</h1>
                <p>This is a placeholder for the blog post page.</p>
            </div>
        </GuestLayout>
    );
}
