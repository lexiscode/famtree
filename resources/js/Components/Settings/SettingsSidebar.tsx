import { ShieldCheck, Lock, Bell, ArrowLeft } from 'lucide-react';

interface SettingsSidebarProps {
    active: 'account' | 'privacy' | 'notifications';
}

export default function SettingsSidebar({ active }: SettingsSidebarProps) {
    const isActive = (section: string) => active === section;

    return (
        <div className="settings-sidebar">
            <div className="settings-sidebar-header">
                <h2 className="settings-sidebar-title">
                    <i className="bi bi-gear-fill"></i>
                    Settings
                </h2>
            </div>

            <ul className="settings-nav-list">
                <li className="settings-nav-item">
                    <a
                        href={route('settings.account')}
                        className={`settings-nav-link ${isActive('account') ? 'active' : ''}`}
                    >
                        <i className="bi bi-shield-check"></i>
                        Account Settings
                    </a>
                </li>
                <li className="settings-nav-item">
                    <a
                        href={route('settings.privacy')}
                        className={`settings-nav-link ${isActive('privacy') ? 'active' : ''}`}
                    >
                        <i className="bi bi-eye-slash"></i>
                        Privacy Settings
                    </a>
                </li>
                <li className="settings-nav-item">
                    <a
                        href={route('settings.notifications')}
                        className={`settings-nav-link ${isActive('notifications') ? 'active' : ''}`}
                    >
                        <i className="bi bi-bell"></i>
                        Notification Settings
                    </a>
                </li>
            </ul>

            {/* Back to Profile Button */}
            <div className="settings-sidebar-footer">
                <a
                    href={route('profile.me')}
                    className="settings-nav-link settings-nav-back"
                    title="Back to your profile"
                >
                    <ArrowLeft size={18} style={{ display: 'inline' }} />
                    Back to Profile
                </a>
            </div>
        </div>
    );
}
