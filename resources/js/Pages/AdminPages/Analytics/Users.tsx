import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Users,
    TrendingUp,
    Shield,
    ShieldOff,
    Calendar,
    Clock,
    CalendarDays,
    UserCheck,
    Baby,
    Zap,
} from 'lucide-react';

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

interface GrowthItem {
    month: string;
    count: number;
    cumulative: number;
}

interface Retention {
    daily: number;
    weekly: number;
    monthly: number;
}

interface TwoFaAdoption {
    enabled: number;
    disabled: number;
}

interface Demographics {
    gender: {
        male: number;
        female: number;
        other: number;
    };
    child_accounts: number;
}

interface Props {
    growth: GrowthItem[];
    retention: Retention;
    twoFaAdoption: TwoFaAdoption;
    demographics: Demographics;
}

export default function UsersAnalytics({ growth, retention, twoFaAdoption, demographics }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const maxCount = growth.length > 0 ? Math.max(...growth.map(g => g.count)) : 1;
    const totalTwoFa = twoFaAdoption.enabled + twoFaAdoption.disabled;
    const twoFaPercent = totalTwoFa > 0 ? Math.round((twoFaAdoption.enabled / totalTwoFa) * 100) : 0;
    const totalGender = demographics.gender.male + demographics.gender.female + demographics.gender.other;

    return (
        <AdminLayout>
            <div style={{ paddingTop: '0.5rem' }}>
                {/* Flash Messages */}
                {(flash?.success || flash?.error) && (
                    <div
                        style={{
                            marginBottom: '2rem',
                            padding: '1.25rem 1.5rem',
                            borderRadius: '12px',
                            background: flash?.error
                                ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
                                : 'linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
                            border: `1px solid ${flash?.error ? 'rgba(220, 38, 38, 0.3)' : 'rgba(22, 163, 74, 0.3)'}`,
                            color: flash?.error ? '#DC2626' : '#16A34A',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                        }}
                    >
                        {flash?.success || flash?.error}
                    </div>
                )}

                {/* Header */}
                <div
                    style={{
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                        borderRadius: '20px',
                        padding: '2.5rem',
                        color: '#FFFFFF',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 16px 48px rgba(13, 110, 253, 0.20)',
                    }}
                >
                    <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <Users size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-1px' }}>
                                User Analytics
                            </h1>
                        </div>
                        <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.95)', margin: 0, maxWidth: '600px', lineHeight: 1.6, fontWeight: 500 }}>
                            Detailed user growth, retention, security, and demographic insights
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                Comprehensive user behavior analytics
                            </span>
                        </div>
                    </div>
                </div>

                {/* Growth Chart */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        padding: '2rem',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        marginBottom: '2rem',
                    }}
                >
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0a0e27' }}>User Growth</h2>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#888' }}>Monthly new registrations and cumulative totals</p>
                    </div>
                    <div style={{ height: '280px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem', paddingTop: '1rem' }}>
                        {growth.length > 0 ? (
                            growth.map((item, i) => {
                                const heightPercent = (item.count / maxCount) * 100;
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            height: '100%',
                                            justifyContent: 'flex-end',
                                        }}
                                    >
                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: THEME.primary }}>{item.count}</span>
                                        <div
                                            style={{
                                                width: '100%',
                                                height: `${Math.max(heightPercent, 4)}%`,
                                                background: `linear-gradient(180deg, ${THEME.primary} 0%, #0a58ca 100%)`,
                                                borderRadius: '8px 8px 0 0',
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                cursor: 'pointer',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = `0 8px 20px ${THEME.primary}30`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                            title={`${item.month}: ${item.count} new (${item.cumulative} total)`}
                                        />
                                        <span style={{ fontSize: '0.68rem', color: '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>{item.month}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                No data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Retention and 2FA Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem', marginBottom: '2rem' }}>
                    {/* Retention Stats */}
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '18px',
                            border: '2px solid #E5E7EB',
                            padding: '2rem',
                            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0a0e27' }}>Retention Rates</h2>
                        <p style={{ margin: '0 0 2rem 0', fontSize: '0.85rem', color: '#888' }}>User return rates by period</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {[
                                { label: 'Daily', value: retention.daily, icon: Clock, color: THEME.primary, lightColor: '#e7f1ff' },
                                { label: 'Weekly', value: retention.weekly, icon: Calendar, color: THEME.success, lightColor: '#e8f5e9' },
                                { label: 'Monthly', value: retention.monthly, icon: CalendarDays, color: THEME.info, lightColor: '#e0f7fa' },
                            ].map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div key={idx}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', backgroundColor: item.lightColor }}>
                                                    <Icon size={18} color={item.color} />
                                                </div>
                                                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151' }}>{item.label} Retention</span>
                                            </div>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: item.color }}>{item.value}%</span>
                                        </div>
                                        <div style={{ height: '10px', background: '#F0F2F7', borderRadius: '5px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${item.value}%`,
                                                    background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}cc 100%)`,
                                                    borderRadius: '5px',
                                                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2FA Adoption */}
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '18px',
                            border: '2px solid #E5E7EB',
                            padding: '2rem',
                            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0a0e27' }}>2FA Adoption</h2>
                        <p style={{ margin: '0 0 2rem 0', fontSize: '0.85rem', color: '#888' }}>Two-factor authentication usage</p>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                                <svg width="160" height="160" viewBox="0 0 160 160">
                                    <circle cx="80" cy="80" r="70" fill="none" stroke="#F0F2F7" strokeWidth="16" />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        fill="none"
                                        stroke={THEME.success}
                                        strokeWidth="16"
                                        strokeDasharray={`${(twoFaPercent / 100) * 440} 440`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 80 80)"
                                        style={{ transition: 'stroke-dasharray 0.6s ease' }}
                                    />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0a0e27' }}>{twoFaPercent}%</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888' }}>Enabled</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    background: '#e8f5e9',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                    border: `1.5px solid ${THEME.success}30`,
                                }}
                            >
                                <Shield size={20} color={THEME.success} style={{ marginBottom: '0.5rem' }} />
                                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: THEME.success }}>{twoFaAdoption.enabled.toLocaleString()}</p>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#6c757d', fontWeight: 600 }}>Enabled</p>
                            </div>
                            <div
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    background: '#ffebee',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                    border: `1.5px solid ${THEME.danger}30`,
                                }}
                            >
                                <ShieldOff size={20} color={THEME.danger} style={{ marginBottom: '0.5rem' }} />
                                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: THEME.danger }}>{twoFaAdoption.disabled.toLocaleString()}</p>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#6c757d', fontWeight: 600 }}>Disabled</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Demographics */}
                <div
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        border: '2px solid #E5E7EB',
                        padding: '2rem',
                        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0a0e27' }}>Demographics</h2>
                    <p style={{ margin: '0 0 2rem 0', fontSize: '0.85rem', color: '#888' }}>User gender distribution and account types</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                        {[
                            { label: 'Male', value: demographics.gender.male, color: THEME.primary, lightColor: '#e7f1ff', icon: UserCheck },
                            { label: 'Female', value: demographics.gender.female, color: '#e91e63', lightColor: '#fce4ec', icon: UserCheck },
                            { label: 'Other', value: demographics.gender.other, color: THEME.secondary, lightColor: '#f0f0f0', icon: UserCheck },
                            { label: 'Child Accounts', value: demographics.child_accounts, color: THEME.warning, lightColor: '#fff8e1', icon: Baby },
                        ].map((item, idx) => {
                            const Icon = item.icon;
                            const percent = totalGender > 0 && idx < 3 ? Math.round((item.value / totalGender) * 100) : null;
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: '14px',
                                        padding: '1.5rem',
                                        border: `2px solid ${item.lightColor}`,
                                        transition: 'all 0.3s ease',
                                        textAlign: 'center',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = item.color;
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = `0 12px 32px ${item.color}20`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = item.lightColor;
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: item.lightColor, margin: '0 auto 1rem' }}>
                                        <Icon size={24} color={item.color} />
                                    </div>
                                    <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: item.color }}>{item.value.toLocaleString()}</p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', fontWeight: 600, color: '#6c757d' }}>{item.label}</p>
                                    {percent !== null && (
                                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', fontWeight: 700, color: item.color }}>{percent}%</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
