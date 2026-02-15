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
    Info,
    Cpu,
    Code2,
    Globe,
} from 'lucide-react';

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

function getDiskBarClass(percent: number): string {
    if (percent >= 90) return 'ap-progress-bar danger';
    if (percent >= 70) return 'ap-progress-bar warning';
    return 'ap-progress-bar success';
}

export default function Health({ health, storage, app_info }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const isConnected = (status: string) => status === 'connected' || status === 'ok' || status === 'healthy';

    return (
        <AdminLayout>
            <div>
{/* Page Header */}
                <div className="ap-page-header">
                    <h1 className="ap-page-title">System Health</h1>
                    <p className="ap-page-subtitle">Monitor infrastructure health, storage usage, and application configuration</p>
                </div>

                {/* Health Check Cards */}
                <div className="ap-section">
                    <h3 className="ap-section-title ap-flex ap-items-center ap-gap-sm">
                        <Server size={18} className="ap-icon-primary" />
                        Health Checks
                    </h3>

                    <div className="ap-stats-grid">
                        {/* Database Card */}
                        <div className="ap-stat-card">
                            <div className="ap-stat-card-header">
                                <div>
                                    <p className="ap-stat-label">Database</p>
                                    <p className="ap-stat-value ap-flex ap-items-center ap-gap-xs">
                                        <span className={`ap-badge-dot ${isConnected(health.database.status) ? 'success' : 'danger'}`} />
                                        <span className="ap-capitalize">{health.database.status}</span>
                                    </p>
                                </div>
                                <div className={`ap-stat-icon ${isConnected(health.database.status) ? 'emerald' : 'red'}`}>
                                    <Database size={20} />
                                </div>
                            </div>
                            <p className="ap-text-sm ap-text-secondary">{health.database.response_time}ms response time</p>
                        </div>

                        {/* Redis Card */}
                        <div className="ap-stat-card">
                            <div className="ap-stat-card-header">
                                <div>
                                    <p className="ap-stat-label">Redis</p>
                                    <p className="ap-stat-value ap-flex ap-items-center ap-gap-xs">
                                        <span className={`ap-badge-dot ${isConnected(health.redis.status) ? 'success' : 'danger'}`} />
                                        <span className="ap-capitalize">{health.redis.status}</span>
                                    </p>
                                </div>
                                <div className={`ap-stat-icon ${isConnected(health.redis.status) ? 'emerald' : 'red'}`}>
                                    <Layers size={20} />
                                </div>
                            </div>
                            <p className="ap-text-sm ap-text-secondary">{health.redis.response_time}ms response time</p>
                        </div>

                        {/* Disk Space Card */}
                        <div className="ap-stat-card">
                            <div className="ap-stat-card-header">
                                <div>
                                    <p className="ap-stat-label">Disk Space</p>
                                    <p className="ap-stat-value">{health.disk.usage_percent}%</p>
                                </div>
                                <div className="ap-stat-icon sky">
                                    <HardDrive size={20} />
                                </div>
                            </div>
                            <div className="ap-progress-track">
                                <div
                                    className={getDiskBarClass(health.disk.usage_percent)}
                                    style={{ width: `${health.disk.usage_percent}%` }}
                                />
                            </div>
                            <div className="ap-flex ap-justify-between ap-mt-sm">
                                <span className="ap-text-sm ap-text-secondary">Total: {health.disk.total}</span>
                                <span className="ap-text-sm ap-text-secondary">Used: {health.disk.used}</span>
                                <span className="ap-text-sm ap-text-secondary">Free: {health.disk.free}</span>
                            </div>
                        </div>

                        {/* Queue Card */}
                        <div className="ap-stat-card">
                            <div className="ap-stat-card-header">
                                <div>
                                    <p className="ap-stat-label">Queue</p>
                                    <p className="ap-stat-value">{health.queue.size}</p>
                                </div>
                                <div className="ap-stat-icon amber">
                                    <Layers size={20} />
                                </div>
                            </div>
                            <div className="ap-flex ap-gap-lg ap-mt-sm">
                                <span className="ap-text-sm ap-text-secondary">Queue Size: <strong>{health.queue.size}</strong></span>
                                <span className={`ap-text-sm ${health.queue.failed > 0 ? 'ap-text-danger' : 'ap-text-secondary'}`}>
                                    Failed: <strong>{health.queue.failed}</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Storage Usage Section */}
                <div className="ap-section">
                    <h3 className="ap-section-title ap-flex ap-items-center ap-gap-sm">
                        <HardDrive size={18} className="ap-icon-success" />
                        Storage Usage
                    </h3>

                    <div className="ap-stats-grid">
                        <div className="ap-stat-card">
                            <div className="ap-stat-card-header">
                                <div>
                                    <p className="ap-stat-label">Profile Images</p>
                                    <p className="ap-stat-value">{storage.profile_images.count.toLocaleString()}</p>
                                </div>
                                <div className="ap-stat-icon indigo">
                                    <Users size={20} />
                                </div>
                            </div>
                            <p className="ap-text-sm ap-text-secondary">{storage.profile_images.size}</p>
                        </div>

                        <div className="ap-stat-card">
                            <div className="ap-stat-card-header">
                                <div>
                                    <p className="ap-stat-label">Post Images</p>
                                    <p className="ap-stat-value">{storage.post_images.count.toLocaleString()}</p>
                                </div>
                                <div className="ap-stat-icon emerald">
                                    <FileText size={20} />
                                </div>
                            </div>
                            <p className="ap-text-sm ap-text-secondary">{storage.post_images.size}</p>
                        </div>

                        <div className="ap-stat-card">
                            <div className="ap-stat-card-header">
                                <div>
                                    <p className="ap-stat-label">Gallery Images</p>
                                    <p className="ap-stat-value">{storage.gallery_images.count.toLocaleString()}</p>
                                </div>
                                <div className="ap-stat-icon sky">
                                    <Image size={20} />
                                </div>
                            </div>
                            <p className="ap-text-sm ap-text-secondary">{storage.gallery_images.size}</p>
                        </div>

                        <div className="ap-stat-card">
                            <div className="ap-stat-card-header">
                                <div>
                                    <p className="ap-stat-label">Voice Files</p>
                                    <p className="ap-stat-value">{storage.voice_files.count.toLocaleString()}</p>
                                </div>
                                <div className="ap-stat-icon amber">
                                    <Mic size={20} />
                                </div>
                            </div>
                            <p className="ap-text-sm ap-text-secondary">{storage.voice_files.size}</p>
                        </div>
                    </div>
                </div>

                {/* App Info Section */}
                <div className="ap-section">
                    <h3 className="ap-section-title ap-flex ap-items-center ap-gap-sm">
                        <Info size={18} className="ap-icon-info" />
                        Application Info
                    </h3>

                    <div className="ap-stats-grid">
                        <div className="ap-stat-card">
                            <div className="ap-stat-card-header">
                                <div>
                                    <p className="ap-stat-label">PHP Version</p>
                                    <p className="ap-stat-value">{app_info.php_version}</p>
                                </div>
                                <div className="ap-stat-icon indigo">
                                    <Code2 size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="ap-stat-card">
                            <div className="ap-stat-card-header">
                                <div>
                                    <p className="ap-stat-label">Laravel Version</p>
                                    <p className="ap-stat-value">{app_info.laravel_version}</p>
                                </div>
                                <div className="ap-stat-icon red">
                                    <Cpu size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="ap-stat-card">
                            <div className="ap-stat-card-header">
                                <div>
                                    <p className="ap-stat-label">Node Version</p>
                                    <p className="ap-stat-value">{app_info.node_version}</p>
                                </div>
                                <div className="ap-stat-icon emerald">
                                    <Globe size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="ap-stat-card">
                            <div className="ap-stat-card-header">
                                <div>
                                    <p className="ap-stat-label">Environment</p>
                                    <p className="ap-stat-value ap-capitalize">{app_info.app_env}</p>
                                </div>
                                <div className="ap-stat-icon amber">
                                    <Info size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
