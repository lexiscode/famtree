import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i == 1 || i == totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        range.forEach((i) => {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
            padding: '1rem 0',
        }}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                    background: '#F5F7FA',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '8px',
                    padding: '0.625rem 0.75rem',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    color: currentPage === 1 ? '#CCC' : '#0052E8',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                    if (currentPage > 1) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)';
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#0052E8';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 82, 232, 0.25)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F5F7FA';
                    e.currentTarget.style.color = currentPage === 1 ? '#CCC' : '#0052E8';
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                <ChevronLeft size={18} />
            </button>

            {getPageNumbers().map((page, index) => (
                <button
                    key={index}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === '...'}
                    style={{
                        background: page === currentPage ? 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)' : '#F5F7FA',
                        color: page === currentPage ? '#FFFFFF' : '#555',
                        border: page === currentPage ? '1px solid rgba(0, 82, 232, 0.2)' : '1px solid rgba(0, 0, 0, 0.08)',
                        borderRadius: '8px',
                        padding: '0.625rem 0.75rem',
                        fontSize: '0.9rem',
                        fontWeight: page === currentPage ? 700 : 500,
                        cursor: page === '...' || page === currentPage ? 'default' : 'pointer',
                        minWidth: '36px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: page === currentPage ? '0 4px 12px rgba(0, 82, 232, 0.25)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                        if (page !== '...' && page !== currentPage) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)';
                            e.currentTarget.style.color = '#FFFFFF';
                            e.currentTarget.style.borderColor = '#0052E8';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 82, 232, 0.25)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (page !== '...' && page !== currentPage) {
                            e.currentTarget.style.background = '#F5F7FA';
                            e.currentTarget.style.color = '#555';
                            e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }
                    }}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                    background: '#F5F7FA',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '8px',
                    padding: '0.625rem 0.75rem',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    color: currentPage === totalPages ? '#CCC' : '#0052E8',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                    if (currentPage < totalPages) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #0052E8 0%, #0040B8 100%)';
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#0052E8';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 82, 232, 0.25)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F5F7FA';
                    e.currentTarget.style.color = currentPage === totalPages ? '#CCC' : '#0052E8';
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
}
