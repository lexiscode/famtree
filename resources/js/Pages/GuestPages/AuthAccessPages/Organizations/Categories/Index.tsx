import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Building2, GraduationCap, Users, Briefcase, Church } from 'lucide-react';
import '../Organizations.css';

interface Category {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    image: string | null;
    organizations_count: number;
}

interface Props {
    categories: Category[];
}

const categoryIcons: Record<string, React.ReactNode> = {
    'higher-institutions': <GraduationCap size={40} />,
    'high-schools': <Building2 size={40} />,
    'football-fans': <Users size={40} />,
    'religious-organizations': <Church size={40} />,
    'default': <Briefcase size={40} />,
};

export default function CategoriesIndex({ categories }: Props) {
    const handleCategoryClick = (slug: string) => {
        router.visit(`/organizations/category/${slug}`);
    };

    return (
        <AuthAccessLayout>
            <div className="organizations-page">
                {/* Background Orbs */}
                <div className="organizations-background">
                    <div className="org-orb org-orb-1"></div>
                    <div className="org-orb org-orb-2"></div>
                    <div className="org-orb org-orb-3"></div>
                </div>

                <div className="organizations-container">
                    {/* Header */}
                    <div className="org-header">
                        <div className="org-header-icon">
                            <Building2 />
                        </div>
                        <h1>Organization Groups</h1>
                        <p>Connect with your community. Find your school, club, or organization and join class set groups.</p>
                    </div>

                    {/* Categories Grid */}
                    {categories.length > 0 ? (
                        <div className="categories-grid">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="category-card"
                                    onClick={() => handleCategoryClick(category.slug)}
                                >
                                    <div className="category-icon">
                                        {category.image ? (
                                            <img src={category.image} alt={category.name} />
                                        ) : (
                                            categoryIcons[category.slug] || categoryIcons['default']
                                        )}
                                    </div>
                                    <h3>{category.name}</h3>
                                    {category.description && (
                                        <p>{category.description}</p>
                                    )}
                                    <span className="category-count">
                                        {category.organizations_count} {category.organizations_count === 1 ? 'organization' : 'organizations'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Building2 size={64} />
                            <h3>No categories available</h3>
                            <p>Organization categories will appear here once they are added.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthAccessLayout>
    );
}
