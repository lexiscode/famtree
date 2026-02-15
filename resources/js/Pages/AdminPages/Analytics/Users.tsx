import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Users,
    Shield,
    ShieldOff,
    Clock,
    Calendar,
    CalendarDays,
    UserCheck,
    Baby,
} from 'lucide-react';

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

    const retentionItems = [
        { label: 'Daily', value: retention.daily, icon: Clock, colorClass: 'indigo' },
        { label: 'Weekly', value: retention.weekly, icon: Calendar, colorClass: 'green' },
        { label: 'Monthly', value: retention.monthly, icon: CalendarDays, colorClass: 'blue' },
    ];

    const demographicItems = [
        { label: 'Male', value: demographics.gender.male, icon: UserCheck, iconClass: 'indigo' },
        { label: 'Female', value: demographics.gender.female, icon: UserCheck, iconClass: 'red' },
        { label: 'Other', value: demographics.gender.other, icon: UserCheck, iconClass: 'purple' },
        { label: 'Child Accounts', value: demographics.child_accounts, icon: Baby, iconClass: 'amber' },
    ];

    return (
        <AdminLayout>
            <div>
{/* Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">User Analytics</h1>
                    <p className="ap-page-subtitle">
                        Detailed user growth, retention, security, and demographic insights
                    </p>
                </div>

                {/* Growth Chart */}
                <div className="ap-card ap-card-lg ap-mb-xl">
                    <div className="ap-card-header">
                        <div>
                            <h2 className="ap-card-title">User Growth</h2>
                            <p className="ap-card-subtitle">Monthly new registrations and cumulative totals</p>
                        </div>
                    </div>
                    <div className="ap-chart-bars">
                        {growth.length > 0 ? (
                            growth.map((item, i) => {
                                const heightPercent = (item.count / maxCount) * 100;
                                return (
                                    <div key={i} className="ap-chart-bar-col">
                                        <span className="ap-text-xs ap-font-semibold">{item.count}</span>
                                        <div
                                            className="ap-chart-bar"
                                            style={{ height: `${Math.max(heightPercent, 4)}%` }}
                                            title={`${item.month}: ${item.count} new (${item.cumulative} total)`}
                                        />
                                        <span className="ap-text-xs ap-text-secondary ap-nowrap">{item.month}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="ap-empty">
                                <p className="ap-empty-text">No data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Retention and 2FA Row */}
                <div className="ap-grid-2 ap-mb-xl">
                    {/* Retention Stats */}
                    <div className="ap-card ap-card-lg">
                        <h2 className="ap-card-title">Retention Rates</h2>
                        <p className="ap-card-subtitle ap-mb-xl">User return rates by period</p>

                        <div className="ap-flex-col ap-gap-xl">
                            {retentionItems.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div key={idx} className="ap-progress-wrap ap-mb-0">
                                        <div className="ap-progress-header">
                                            <div className="ap-flex ap-items-center ap-gap-sm">
                                                <div className={`ap-stat-icon ${item.colorClass}`}>
                                                    <Icon size={18} />
                                                </div>
                                                <span className="ap-progress-label ap-font-semibold">{item.label} Retention</span>
                                            </div>
                                            <span className="ap-progress-value">{item.value}%</span>
                                        </div>
                                        <div className="ap-progress-track">
                                            <div
                                                className={`ap-progress-bar ${item.colorClass}`}
                                                style={{ width: `${item.value}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2FA Adoption */}
                    <div className="ap-card ap-card-lg">
                        <h2 className="ap-card-title">2FA Adoption</h2>
                        <p className="ap-card-subtitle ap-mb-xl">Two-factor authentication usage</p>

                        <div className="ap-flex ap-justify-center ap-mb-xl">
                            <div className="ap-donut-wrap">
                                <svg width="160" height="160" viewBox="0 0 160 160">
                                    <circle cx="80" cy="80" r="70" fill="none" stroke="var(--ap-border-light)" strokeWidth="16" />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        fill="none"
                                        stroke="var(--ap-success)"
                                        strokeWidth="16"
                                        strokeDasharray={`${(twoFaPercent / 100) * 440} 440`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 80 80)"
                                    />
                                </svg>
                                <div className="ap-donut-label">
                                    <span className="ap-stat-value">{twoFaPercent}%</span>
                                    <span className="ap-text-xs ap-text-secondary ap-font-semibold">Enabled</span>
                                </div>
                            </div>
                        </div>

                        <div className="ap-grid-2">
                            <div className="ap-card ap-text-center">
                                <Shield size={20} className="ap-mb-sm ap-icon-success" />
                                <p className="ap-stat-value ap-text-success">{twoFaAdoption.enabled.toLocaleString()}</p>
                                <p className="ap-text-sm ap-text-secondary ap-font-semibold ap-mb-0">Enabled</p>
                            </div>
                            <div className="ap-card ap-text-center">
                                <ShieldOff size={20} className="ap-mb-sm ap-icon-danger" />
                                <p className="ap-stat-value ap-text-danger">{twoFaAdoption.disabled.toLocaleString()}</p>
                                <p className="ap-text-sm ap-text-secondary ap-font-semibold ap-mb-0">Disabled</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Demographics */}
                <div className="ap-card ap-card-lg">
                    <h2 className="ap-card-title">Demographics</h2>
                    <p className="ap-card-subtitle ap-mb-xl">User gender distribution and account types</p>

                    <div className="ap-stats-grid">
                        {demographicItems.map((item, idx) => {
                            const Icon = item.icon;
                            const percent = totalGender > 0 && idx < 3 ? Math.round((item.value / totalGender) * 100) : null;
                            return (
                                <div key={idx} className="ap-stat-card ap-text-center">
                                    <div className={`ap-stat-icon ${item.iconClass} ap-stat-icon-centered`}>
                                        <Icon size={20} />
                                    </div>
                                    <p className="ap-stat-value">{item.value.toLocaleString()}</p>
                                    <p className="ap-text-sm ap-text-secondary ap-font-semibold">{item.label}</p>
                                    {percent !== null && (
                                        <span className="ap-badge ap-badge-primary ap-mt-sm">{percent}%</span>
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
