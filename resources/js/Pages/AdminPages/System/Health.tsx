import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Server,
    Database,
    HardDrive,
    Layers,
    Image,
    Mic,
    Users,
    FileText,
    Zap,
    Info,
    Cpu,
    Code2,
    Globe,
} from 'lucide-react';

const THEME = {
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    secondary: '#6c757d',
};

interface Props {
    health: {
        database: { status: string; response_time: number };
        redis: { status: string; response_time: number };
        disk: { total: string; used: string; free: string; usage_percent: number };
        queue: { size: number; failed: number };
    };
    storage: {
        profile_images: { count: number; size: string };
        post_images: { count: number; size: string };
        gallery_images: { count: number; size: string };
        voice_files: { count: number; size: string };
    };
    app_info: {
        php_version: string;
        laravel_version: string;
        node_version: string;
        app_env: string;
    };
}

export default function Health({ health, storage, app_info }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const isConnected = (status: string) => status === 'connected' || status === 'ok' || status === 'healthy';

    const getDiskBarColor = (percent: number) => {
        if (percent >= 90) return THEME.danger;
        if (percent >= 70) return THEME.warning;
        return THEME.success;
    };

    const healthCards = [
        {
            label: 'Database',
            icon: Database,
            status: health.database.status,
            color: isConnected(health.database.status) ? THEME.success : THEME.danger,
            lightColor: isConnected(health.database.status) ? '#e8f5e9' : '#f8d7da',
            detail: `${health.database.response_time}ms response time`,
        },
        {
            label: 'Redis',
            icon: Layers,
            status: health.redis.status,
            color: isConnected(health.redis.status) ? THEME.success : THEME.danger,
            lightColor: isConnected(health.redis.status) ? '#e8f5e9' : '#f8d7da',
            detail: `${health.redis.response_time}ms response time`,
        },
    ];

    const storageCards = [
        { label: 'Profile Images', icon: Users, count: storage.profile_images.count, size: storage.profile_images.size, color: THEME.primary, lightColor: '#e7f1ff' },
        { label: 'Post Images', icon: FileText, count: storage.post_images.count, size: storage.post_images.size, color: THEME.success, lightColor: '#e8f5e9' },
        { label: 'Gallery Images', icon: Image, count: storage.gallery_images.count, size: storage.gallery_images.size, color: THEME.info, lightColor: '#e0f7fa' },
        { label: 'Voice Files', icon: Mic, count: storage.voice_files.count, size: storage.voice_files.size, color: THEME.warning, lightColor: '#fff8e1' },
    ];

    const appInfoItems = [
        { label: 'PHP Version', value: app_info.php_version, icon: Code2, color: THEME.primary, lightColor: '#e7f1ff' },
        { label: 'Laravel Version', value: app_info.laravel_version, icon: Cpu, color: THEME.danger, lightColor: '#f8d7da' },
        { label: 'Node Version', value: app_info.node_version, icon: Globe, color: THEME.success, lightColor: '#e8f5e9' },
        { label: 'Environment', value: app_info.app_env, icon: Info, color: THEME.warning, lightColor: '#fff8e1' },
    ];

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
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
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
                    <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '50%' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <Server size={32} color="#FFFFFF" strokeWidth={1.5} />
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-1px' }}>
                                System Health
                            </h1>
                        </div>
                        <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.95)', margin: 0, maxWidth: '600px', lineHeight: 1.6, fontWeight: 500 }}>
                            Monitor infrastructure health, storage usage, and application configuration
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            <Zap size={16} color="#FFD700" fill="#FFD700" />
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                                Real-time system diagnostics and health checks
                            </span>
                        </div>
                    </div>
                </div>

                {/* Health Check Cards */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#e7f1ff' }}>
                            <Server size={20} color={THEME.primary} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#0a0e27' }}>
                            Health Checks
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem' }}>
                        {/* Database & Redis Cards */}
                        {healthCards.map((card, idx) => {
                            const Icon = card.icon;
                            const connected = isConnected(card.status);
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: '18px',
                                        padding: '1.75rem',
                                        border: `2.5px solid ${card.lightColor}`,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = card.color;
                                        e.currentTarget.style.boxShadow = `0 20px 48px ${card.color}20, 0 2px 12px rgba(0, 0, 0, 0.04)`;
                                        e.currentTarget.style.transform = 'translateY(-6px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = card.lightColor;
                                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: card.lightColor, borderRadius: '50%', opacity: 0.3, transform: 'translate(30%, -30%)' }} />
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '14px', backgroundColor: card.lightColor }}>
                                                    <Icon size={24} color={card.color} strokeWidth={1.5} />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>{card.label}</p>
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    width: '14px',
                                                    height: '14px',
                                                    borderRadius: '50%',
                                                    backgroundColor: connected ? THEME.success : THEME.danger,
                                                    boxShadow: `0 0 0 4px ${connected ? THEME.success : THEME.danger}25`,
                                                    flexShrink: 0,
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '0.35rem 0.75rem',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                fontWeight: 700,
                                                backgroundColor: card.lightColor,
                                                color: card.color,
                                                textTransform: 'capitalize',
                                            }}>
                                                {card.status}
                                            </span>
                                            <span style={{ fontSize: '0.88rem', color: '#6c757d', fontWeight: 500 }}>
                                                {card.detail}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Disk Space Card */}
                        <div
                            style={{
                                background: '#FFFFFF',
                                borderRadius: '18px',
                                padding: '1.75rem',
                                border: '2.5px solid #e0f7fa',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = THEME.info;
                                e.currentTarget.style.boxShadow = `0 20px 48px ${THEME.info}20, 0 2px 12px rgba(0, 0, 0, 0.04)`;
                                e.currentTarget.style.transform = 'translateY(-6px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e0f7fa';
                                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: '#e0f7fa', borderRadius: '50%', opacity: 0.3, transform: 'translate(30%, -30%)' }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#e0f7fa' }}>
                                        <HardDrive size={24} color={THEME.info} strokeWidth={1.5} />
                                    </div>
                                    <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>Disk Space</p>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6c757d' }}>Usage</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: getDiskBarColor(health.disk.usage_percent) }}>
                                            {health.disk.usage_percent}%
                                        </span>
                                    </div>
                                    <div style={{ height: '10px', background: '#F0F2F7', borderRadius: '5px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${health.disk.usage_percent}%`,
                                                background: `linear-gradient(90deg, ${getDiskBarColor(health.disk.usage_percent)} 0%, ${getDiskBarColor(health.disk.usage_percent)}cc 100%)`,
                                                borderRadius: '5px',
                                                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                                    <div style={{ textAlign: 'center', flex: 1, padding: '0.5rem', background: '#F9FAFB', borderRadius: '8px' }}>
                                        <p style={{ fontSize: '0.72rem', color: '#6c757d', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Total</p>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0a0e27', margin: '0.25rem 0 0 0' }}>{health.disk.total}</p>
                                    </div>
                                    <div style={{ textAlign: 'center', flex: 1, padding: '0.5rem', background: '#F9FAFB', borderRadius: '8px' }}>
                                        <p style={{ fontSize: '0.72rem', color: '#6c757d', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Used</p>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 800, color: THEME.warning, margin: '0.25rem 0 0 0' }}>{health.disk.used}</p>
                                    </div>
                                    <div style={{ textAlign: 'center', flex: 1, padding: '0.5rem', background: '#F9FAFB', borderRadius: '8px' }}>
                                        <p style={{ fontSize: '0.72rem', color: '#6c757d', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Free</p>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 800, color: THEME.success, margin: '0.25rem 0 0 0' }}>{health.disk.free}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Queue Card */}
                        <div
                            style={{
                                background: '#FFFFFF',
                                borderRadius: '18px',
                                padding: '1.75rem',
                                border: '2.5px solid #fff8e1',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = THEME.warning;
                                e.currentTarget.style.boxShadow = `0 20px 48px ${THEME.warning}20, 0 2px 12px rgba(0, 0, 0, 0.04)`;
                                e.currentTarget.style.transform = 'translateY(-6px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#fff8e1';
                                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: '#fff8e1', borderRadius: '50%', opacity: 0.3, transform: 'translate(30%, -30%)' }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#fff8e1' }}>
                                        <Layers size={24} color={THEME.warning} strokeWidth={1.5} />
                                    </div>
                                    <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0a0e27', margin: 0 }}>Queue</p>
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Queue Size</p>
                                        <p style={{ fontSize: '1.75rem', fontWeight: 800, color: THEME.primary, margin: '0.25rem 0 0 0', lineHeight: 1 }}>{health.queue.size}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Failed</p>
                                        <p style={{ fontSize: '1.75rem', fontWeight: 800, color: health.queue.failed > 0 ? THEME.danger : THEME.success, margin: '0.25rem 0 0 0', lineHeight: 1 }}>{health.queue.failed}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Storage Usage Section */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#e8f5e9' }}>
                            <HardDrive size={20} color={THEME.success} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#0a0e27' }}>
                            Storage Usage
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.75rem' }}>
                        {storageCards.map((card, idx) => {
                            const Icon = card.icon;
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: '18px',
                                        padding: '1.75rem',
                                        border: `2.5px solid ${card.lightColor}`,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = card.color;
                                        e.currentTarget.style.boxShadow = `0 20px 48px ${card.color}20, 0 2px 12px rgba(0, 0, 0, 0.04)`;
                                        e.currentTarget.style.transform = 'translateY(-6px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = card.lightColor;
                                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: card.lightColor, borderRadius: '50%', opacity: 0.3, transform: 'translate(30%, -30%)' }} />
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {card.label}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '12px', backgroundColor: card.lightColor }}>
                                                <Icon size={22} color={card.color} strokeWidth={1.5} />
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '2rem', fontWeight: 800, color: card.color, margin: 0, lineHeight: 1 }}>
                                            {card.count.toLocaleString()}
                                        </p>
                                        <p style={{ fontSize: '0.85rem', color: '#6c757d', margin: '0.5rem 0 0 0', fontWeight: 600 }}>
                                            files
                                        </p>
                                        <div style={{ marginTop: '1rem', padding: '0.5rem 0.75rem', background: '#F9FAFB', borderRadius: '8px', display: 'inline-block' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>
                                                {card.size}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* App Info Section */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#e7f1ff' }}>
                            <Info size={20} color={THEME.primary} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#0a0e27' }}>
                            Application Info
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.75rem' }}>
                        {appInfoItems.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: '18px',
                                        padding: '1.75rem',
                                        border: `2.5px solid ${item.lightColor}`,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = item.color;
                                        e.currentTarget.style.boxShadow = `0 20px 48px ${item.color}20, 0 2px 12px rgba(0, 0, 0, 0.04)`;
                                        e.currentTarget.style.transform = 'translateY(-6px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = item.lightColor;
                                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: item.lightColor, borderRadius: '50%', opacity: 0.3, transform: 'translate(30%, -30%)' }} />
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '12px', backgroundColor: item.lightColor }}>
                                                <Icon size={22} color={item.color} strokeWidth={1.5} />
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {item.label}
                                            </p>
                                        </div>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: item.color, margin: 0, lineHeight: 1 }}>
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
