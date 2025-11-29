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
            border: '1px solid #E8E8E8',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: title ? '1.5rem' : 0,
            }}>
                {title && (
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: '#1a1a1a',
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
