import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

interface Props {
    families: any[];
}

export default function FamilyExplorer({ families }: Props) {
    return (
        <GuestLayout>
            <Head title="Public Families - FamTree" />
            <div style={{ padding: '40px 20px' }}>
                <h1>Public Families</h1>
                <p>This is a placeholder for the family explorer page.</p>
                <p>Found {families.length} families</p>
            </div>
        </GuestLayout>
    );
}
