import { ReactNode } from 'react';

interface DashboardCardProps {
    title: string;
    children: ReactNode;
    action?: ReactNode;
}

export default function DashboardCard({ title, children, action }: DashboardCardProps) {
    return (
        <div style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '14px',
            padding: '2rem',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: title ? '1.75rem' : 0,
            }}>
                {title && (
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#0a0e27',
                        letterSpacing: '-0.3px',
                    }}>
                        {title}
                    </h2>
                )}
                {action && <div>{action}</div>}
            </div>
            {children}
        </div>
    );
}
