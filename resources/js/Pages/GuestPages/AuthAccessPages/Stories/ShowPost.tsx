import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import PostCard from './PostCard';
import { Post } from '@/types';

interface Props {
    post: Post;
}

export default function ShowPost({ post }: Props) {
    return (
        <AuthAccessLayout>
            <Head title={post.title || 'Post'} />
            <div className="stories-page">
                <div className="stories-container" style={{ maxWidth: '700px' }}>
                    <button className="back-button" onClick={() => window.history.length > 1 ? window.history.back() : router.visit('/')}>
                        <ArrowLeft size={18} /> Back to Feed
                    </button>

                    <PostCard
                        post={post}
                        onPostDeleted={() => router.visit('/')}
                        defaultShowComments={true}
                    />
                </div>
            </div>
        </AuthAccessLayout>
    );
}
