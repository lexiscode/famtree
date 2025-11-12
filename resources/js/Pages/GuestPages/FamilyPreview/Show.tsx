import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

interface Props {
    slug: string;
    family: any;
}

export default function FamilyPreview({ slug, family }: Props) {
    return (
        <GuestLayout>
            <Head title={`${slug} Family - FamTree`} />
            <div style={{ padding: '40px 20px' }}>
                <h1>Family: {slug}</h1>
                <p>This is a placeholder for the family preview page.</p>
            </div>
        </GuestLayout>
    );
}
