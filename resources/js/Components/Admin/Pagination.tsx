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
                    background: '#F5F5F5',
                    border: '1px solid #E0E0E0',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    if (currentPage > 1) {
                        e.currentTarget.style.background = '#0052E8';
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#0052E8';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F5F5F5';
                    e.currentTarget.style.color = '#666';
                    e.currentTarget.style.borderColor = '#E0E0E0';
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
                        background: page === currentPage ? '#0052E8' : '#F5F5F5',
                        color: page === currentPage ? '#FFFFFF' : '#666',
                        border: page === currentPage ? '1px solid #0052E8' : '1px solid #E0E0E0',
                        borderRadius: '6px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.9rem',
                        fontWeight: page === currentPage ? 600 : 500,
                        cursor: page === '...' || page === currentPage ? 'default' : 'pointer',
                        minWidth: '36px',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        if (page !== '...' && page !== currentPage) {
                            e.currentTarget.style.background = '#0052E8';
                            e.currentTarget.style.color = '#FFFFFF';
                            e.currentTarget.style.borderColor = '#0052E8';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (page !== '...' && page !== currentPage) {
                            e.currentTarget.style.background = '#F5F5F5';
                            e.currentTarget.style.color = '#666';
                            e.currentTarget.style.borderColor = '#E0E0E0';
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
                    background: '#F5F5F5',
                    border: '1px solid #E0E0E0',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    if (currentPage < totalPages) {
                        e.currentTarget.style.background = '#0052E8';
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#0052E8';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F5F5F5';
                    e.currentTarget.style.color = '#666';
                    e.currentTarget.style.borderColor = '#E0E0E0';
                }}
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
}
