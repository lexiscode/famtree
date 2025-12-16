import { router } from '@inertiajs/react';
import { Circle, TrendingUp, X } from 'lucide-react';
import { ProfileCompletion } from '@/types/inertia';

interface Props {
    data: ProfileCompletion;
    onClose: () => void;
}

export default function ProfileCompletionModal({ data, onClose }: Props) {
    const { percentage, completed_count, total_count, missing_fields } = data;

    // Calculate progress bar width
    const progressWidth = `${percentage}%`;

    return (
        <>
            {/* Modal Overlay */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '1rem',
                }}
                onClick={onClose}
            >
                {/* Modal Container */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '20px',
                        maxWidth: '500px',
                        width: '100%',
                        color: 'white',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                        position: 'relative',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            color: 'white',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <X size={20} />
                    </button>

                    {/* Modal Content */}
                    <div style={{ padding: '2rem' }}>
                        {/* Header */}
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h5 className="mb-0 d-flex align-items-center gap-2" style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: 'white'
                            }}>
                                <TrendingUp size={28} />
                                Profile Completion
                            </h5>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.25)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                padding: '0.6rem 1.2rem',
                                fontWeight: '700',
                                fontSize: '1.75rem'
                            }}>
                                {percentage}%
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '12px',
                            height: '14px',
                            marginBottom: '1.25rem',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <div style={{
                                background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 1) 100%)',
                                height: '100%',
                                width: progressWidth,
                                borderRadius: '12px',
                                transition: 'width 0.5s ease-in-out',
                                boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                            }} />
                        </div>

                        {/* Completion Stats */}
                        <p style={{
                            marginBottom: '1.5rem',
                            color: 'rgba(255, 255, 255, 0.95)',
                            fontSize: '1rem',
                            fontWeight: '500',
                            textAlign: 'center'
                        }}>
                            {completed_count} of {total_count} fields completed
                        </p>

                        {/* Missing Fields */}
                        {missing_fields.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{
                                    fontSize: '1rem',
                                    marginBottom: '1rem',
                                    color: 'rgba(255, 255, 255, 0.95)',
                                    fontWeight: '600'
                                }}>
                                    Complete these fields:
                                </p>
                                <div className="d-flex flex-wrap gap-2">
                                    {missing_fields.map((field) => (
                                        <span
                                            key={field.key}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.25)',
                                                backdropFilter: 'blur(10px)',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '10px',
                                                fontSize: '0.9rem',
                                                fontWeight: '500',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Circle size={14} />
                                            {field.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTA Button */}
                        <button
                            onClick={() => {
                                onClose();
                                router.visit(route('settings.account'));
                            }}
                            className="btn w-100"
                            style={{
                                background: 'white',
                                color: '#667eea',
                                fontWeight: '700',
                                padding: '0.9rem',
                                borderRadius: '12px',
                                border: 'none',
                                marginTop: '0.5rem',
                                fontSize: '1rem',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            Complete Your Profile
                        </button>

                        {/* Encouragement Message */}
                        {percentage >= 80 && percentage < 100 && (
                            <p style={{
                                marginTop: '1.25rem',
                                marginBottom: 0,
                                textAlign: 'center',
                                fontSize: '0.95rem',
                                color: 'rgba(255, 255, 255, 0.95)',
                                fontWeight: '500'
                            }}>
                                You're almost there! Just a few more fields to go.
                            </p>
                        )}
                        {percentage < 80 && (
                            <p style={{
                                marginTop: '1.25rem',
                                marginBottom: 0,
                                textAlign: 'center',
                                fontSize: '0.95rem',
                                color: 'rgba(255, 255, 255, 0.95)',
                                fontWeight: '500'
                            }}>
                                Complete your profile to help family members connect with you!
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
