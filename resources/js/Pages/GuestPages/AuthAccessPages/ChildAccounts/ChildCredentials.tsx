import { useCallback, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Copy, Eye, EyeOff, CheckCircle, Home } from 'lucide-react';

interface Child {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    username: string;
}

interface Props {
    child: Child;
    temporaryPassword: string;
}

export default function ChildCredentials({ child, temporaryPassword }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopyToClipboard = useCallback((text: string, fieldName: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(null), 2000);
        });
    }, []);

    const handleContinue = useCallback(() => {
        router.get(route('child-accounts.index'));
    }, []);

    return (
        <GuestLayout>
            <div className="child-accounts-page">
                <div className="container-lg" style={{ maxWidth: '700px', margin: '0 auto', padding: '0 1.5rem' }}>
                    {/* Success Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(0, 217, 127, 0.15) 0%, rgba(0, 82, 232, 0.1) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #00D97F',
                            }}>
                                <CheckCircle size={48} style={{ color: '#00D97F' }} />
                            </div>
                        </div>
                        <h1 className="child-form-title" style={{ marginBottom: '0.5rem' }}>Account Created Successfully!</h1>
                        <p className="child-form-subtitle">
                            Here are the login credentials for {child.full_name}
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="child-info-alert" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(0, 217, 127, 0.08) 0%, rgba(0, 82, 232, 0.05) 100%)', borderColor: 'rgba(0, 217, 127, 0.15)' }}>
                        <CheckCircle size={20} style={{ color: '#00D97F' }} />
                        <div>
                            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Next Steps:</div>
                            <ul style={{ fontSize: '0.85rem', margin: 0, paddingLeft: '1.4rem' }}>
                                <li style={{ marginBottom: '0.3rem' }}>Save these credentials in a secure location</li>
                                <li style={{ marginBottom: '0.3rem' }}>Share the username and password with your child</li>
                                <li style={{ marginBottom: '0.3rem' }}>Your child should change the password after first login</li>
                                <li>At age 18, they can set their own email address</li>
                            </ul>
                        </div>
                    </div>

                    {/* Credentials Container */}
                    <div style={{ marginBottom: '2rem' }}>
                        {/* Username */}
                        <div className="child-form-group">
                            <label className="child-form-label">Username</label>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <input
                                    type="text"
                                    value={child.username}
                                    readOnly
                                    className="child-form-input"
                                    style={{ cursor: 'default' }}
                                />
                                <button
                                    onClick={() => handleCopyToClipboard(child.username, 'username')}
                                    className="child-copy-btn"
                                    title="Copy username"
                                >
                                    {copiedField === 'username' ? (
                                        <CheckCircle size={18} style={{ color: '#00D97F' }} />
                                    ) : (
                                        <Copy size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Temporary Password */}
                        <div className="child-form-group">
                            <label className="child-form-label">Temporary Password</label>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={temporaryPassword}
                                    readOnly
                                    className="child-form-input"
                                    style={{ cursor: 'default' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="child-toggle-btn"
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                                <button
                                    onClick={() => handleCopyToClipboard(temporaryPassword, 'password')}
                                    className="child-copy-btn"
                                    title="Copy password"
                                >
                                    {copiedField === 'password' ? (
                                        <CheckCircle size={18} style={{ color: '#00D97F' }} />
                                    ) : (
                                        <Copy size={18} />
                                    )}
                                </button>
                            </div>
                            <div className="child-form-help">
                                Share this temporary password with {child.first_name}. They should change it on first login.
                            </div>
                        </div>
                    </div>

                    {/* Warning Box */}
                    <div className="child-info-alert" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(255, 71, 87, 0.05) 100%)', borderColor: 'rgba(255, 71, 87, 0.15)' }}>
                        <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#1a1a1a' }}>
                            <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#FF4757' }}>Important:</div>
                            <ul style={{ margin: 0, paddingLeft: '1.4rem', fontSize: '0.8rem' }}>
                                <li style={{ marginBottom: '0.25rem' }}>This temporary password can only be viewed once</li>
                                <li style={{ marginBottom: '0.25rem' }}>If you lose it, you'll need to create a new account</li>
                                <li>Keep this information secure and private</li>
                            </ul>
                        </div>
                    </div>

                    {/* Quick Info Box */}
                    <div style={{ background: 'rgba(0, 82, 232, 0.08)', border: '2px solid rgba(0, 82, 232, 0.15)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#1a1a1a' }}>
                            <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Child Account Details:</div>
                            <div style={{ fontSize: '0.85rem', color: '#6C757D' }}>
                                <div style={{ marginBottom: '0.4rem' }}>
                                    <strong>Name:</strong> {child.full_name}
                                </div>
                                <div>
                                    <strong>Account Type:</strong> Child Account (requires parental oversight)
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="child-form-actions">
                        <button
                            onClick={handleContinue}
                            className="child-form-submit"
                            style={{ width: '100%' }}
                        >
                            <Home size={18} />
                            Back to Child Accounts
                        </button>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
