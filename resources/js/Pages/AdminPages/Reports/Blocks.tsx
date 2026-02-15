import { useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ShieldOff,
    Trash2,
} from 'lucide-react';

interface Block {
    id: number;
    blocker: { id: number; full_name: string; username: string } | null;
    blocked_user: { id: number; full_name: string; username: string } | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: Block[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface Props {
    blocks: PaginatedData;
}

export default function Blocks({ blocks }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const handlePageChange = useCallback((page: number) => {
        router.get(route('admin.blocks.index'), { page }, { preserveScroll: true });
    }, []);

    const handleRemoveBlock = (blockId: number) => {
        if (confirm('Are you sure you want to remove this block? The blocker will be able to interact with the blocked user again.')) {
            router.delete(route('admin.blocks.destroy', blockId), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <div>
{/* Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">User Blocks</h1>
                    <p className="ap-page-subtitle">
                        View and manage user block relationships across the platform ({blocks.total} total block{blocks.total !== 1 ? 's' : ''})
                    </p>
                </div>

                {/* Blocks Table */}
                <div className="ap-table-wrap">
                    {blocks.data.length > 0 ? (
                        <div className="ap-table-scroll">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Blocker</th>
                                        <th>Blocked User</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {blocks.data.map((block) => (
                                        <tr key={block.id}>
                                            <td>
                                                {block.blocker ? (
                                                    <div className="ap-user-cell">
                                                        <div className="ap-avatar ap-avatar-md ap-avatar-indigo">
                                                            {block.blocker.full_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="ap-user-cell-name">{block.blocker.full_name}</p>
                                                            <p className="ap-user-cell-sub">@{block.blocker.username}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="ap-text-secondary">Deleted User</span>
                                                )}
                                            </td>
                                            <td>
                                                {block.blocked_user ? (
                                                    <div className="ap-user-cell">
                                                        <div className="ap-avatar ap-avatar-md ap-avatar-indigo">
                                                            {block.blocked_user.full_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="ap-user-cell-name">{block.blocked_user.full_name}</p>
                                                            <p className="ap-user-cell-sub">@{block.blocked_user.username}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="ap-text-secondary">Deleted User</span>
                                                )}
                                            </td>
                                            <td className="secondary">
                                                {new Date(block.created_at).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <button
                                                    className="ap-btn ap-btn-danger ap-btn-sm"
                                                    onClick={() => handleRemoveBlock(block.id)}
                                                >
                                                    <Trash2 size={14} />
                                                    Remove Block
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ap-empty">
                            <div className="ap-empty-icon">
                                <ShieldOff size={24} />
                            </div>
                            <p className="ap-empty-title">No blocks found</p>
                            <p className="ap-empty-text">There are currently no user blocks in the system</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {blocks.last_page > 1 && (
                    <div className="ap-pagination">
                        <p className="ap-pagination-info">
                            Showing <strong>{blocks.from}</strong> to{' '}
                            <strong>{blocks.to}</strong> of{' '}
                            <strong>{blocks.total}</strong> results
                        </p>
                        <div className="ap-pagination-btns">
                            {blocks.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (link.url) {
                                            const url = new URL(link.url, window.location.origin);
                                            const page = url.searchParams.get('page') || '1';
                                            handlePageChange(parseInt(page));
                                        }
                                    }}
                                    disabled={!link.url}
                                    className={`ap-page-btn ${link.active ? 'active' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
