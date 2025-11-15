import { router } from '@inertiajs/react';
import AuthAccessLayout from '@/Layouts/AuthAccessLayout';
import { Lock, Calendar, ArrowLeft } from 'lucide-react';

interface Props {
    currentAge: number | null;
    requiredAge: number;
}

export default function AgeRestricted({ currentAge, requiredAge }: Props) {
    const yearsUntilEligible = currentAge ? requiredAge - currentAge : null;

    return (
        <AuthAccessLayout>
            <div className="age-restricted-page">
                <div className="age-restricted-container">
                    <div className="age-restricted-card">
                        {/* Icon */}
                        <div className="age-restricted-icon">
                            <Lock size={64} />
                        </div>

                        {/* Heading */}
                        <h1 className="age-restricted-title">Access Restricted</h1>

                        {/* Main Message */}
                        <p className="age-restricted-message">
                            You must be at least <strong>{requiredAge} years old</strong> to manage child accounts.
                        </p>

                        {/* Age Information */}
                        <div className="age-info-box">
                            <div className="age-info-item">
                                <div className="age-info-label">Your Current Age</div>
                                <div className="age-info-value">
                                    {currentAge !== null ? currentAge : 'Unknown'}
                                </div>
                            </div>
                            <div className="age-info-divider">→</div>
                            <div className="age-info-item">
                                <div className="age-info-label">Minimum Required Age</div>
                                <div className="age-info-value">{requiredAge}</div>
                            </div>
                        </div>

                        {/* Eligibility Message */}
                        {yearsUntilEligible !== null && yearsUntilEligible > 0 && (
                            <div className="age-eligibility-box">
                                <Calendar size={20} />
                                <div>
                                    <p className="eligibility-text">
                                        You'll be eligible to manage child accounts in <strong>{yearsUntilEligible} year{yearsUntilEligible !== 1 ? 's' : ''}</strong>.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="age-restricted-description">
                            <p>
                                Child account management features are restricted to users who are 18 years or older to ensure parental responsibility and account security.
                            </p>
                        </div>

                        {/* Back Button */}
                        <button
                            onClick={() => router.visit(route('home'))}
                            className="back-to-profile-btn"
                        >
                            <ArrowLeft size={18} />
                            Back to Profile
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .age-restricted-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #0F1419 0%, #1a2332 50%, #0F1419 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    position: relative;
                    overflow: hidden;
                }

                .age-restricted-page::before {
                    content: '';
                    position: fixed;
                    top: 10%;
                    right: 10%;
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, rgba(124, 58, 237, 0) 70%);
                    border-radius: 50%;
                    filter: blur(60px);
                    animation: floatOrb 25s ease-in-out infinite;
                    pointer-events: none;
                    z-index: 1;
                }

                .age-restricted-page::after {
                    content: '';
                    position: fixed;
                    bottom: 20%;
                    left: 5%;
                    width: 250px;
                    height: 250px;
                    background: radial-gradient(circle, rgba(0, 82, 232, 0.25) 0%, rgba(0, 82, 232, 0) 70%);
                    border-radius: 50%;
                    filter: blur(60px);
                    animation: floatOrb 30s ease-in-out infinite reverse;
                    pointer-events: none;
                    z-index: 1;
                }

                @keyframes floatOrb {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    33% { transform: translateY(-40px) translateX(20px); }
                    66% { transform: translateY(40px) translateX(-20px); }
                }

                .age-restricted-container {
                    position: relative;
                    z-index: 2;
                    max-width: 500px;
                    width: 100%;
                }

                .age-restricted-card {
                    background: rgba(20, 25, 35, 0.8);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(0, 82, 232, 0.2);
                    border-radius: 20px;
                    padding: 3rem 2.5rem;
                    text-align: center;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08);
                    animation: slideInUp 0.6s ease-out;
                }

                .age-restricted-icon {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 2rem;
                    color: #7c3aed;
                    animation: bounceIn 0.6s ease-out;
                }

                @keyframes bounceIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .age-restricted-title {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #fff;
                    margin: 0 0 1rem 0;
                    font-family: 'Playfair Display', serif;
                    letter-spacing: -0.5px;
                }

                .age-restricted-message {
                    font-size: 1.1rem;
                    color: #b0c4de;
                    margin: 0 0 2rem 0;
                    line-height: 1.6;
                }

                .age-restricted-message strong {
                    color: #00d4ff;
                    font-weight: 700;
                }

                .age-info-box {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1.5rem;
                    background: linear-gradient(135deg, rgba(0, 82, 232, 0.1), rgba(124, 58, 237, 0.1));
                    border: 1px solid rgba(0, 82, 232, 0.2);
                    border-radius: 14px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                }

                .age-info-item {
                    flex: 1;
                    text-align: center;
                }

                .age-info-label {
                    font-size: 0.85rem;
                    color: #7a8ba8;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 0.5rem;
                }

                .age-info-value {
                    font-size: 2rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #0052e8, #7c3aed);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .age-info-divider {
                    font-size: 1.5rem;
                    color: #0052e8;
                    opacity: 0.6;
                }

                .age-eligibility-box {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    background: rgba(34, 197, 94, 0.1);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    border-radius: 12px;
                    padding: 1.25rem;
                    margin-bottom: 2rem;
                    color: #86efac;
                }

                .age-eligibility-box svg {
                    flex-shrink: 0;
                    color: #22c55e;
                    margin-top: 2px;
                }

                .eligibility-text {
                    margin: 0;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    text-align: left;
                }

                .eligibility-text strong {
                    color: #22c55e;
                    font-weight: 700;
                }

                .age-restricted-description {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 10px;
                    padding: 1.5rem;
                    margin-bottom: 2.5rem;
                }

                .age-restricted-description p {
                    margin: 0;
                    font-size: 0.95rem;
                    color: #b0c4de;
                    line-height: 1.7;
                }

                .back-to-profile-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.65rem;
                    padding: 0.85rem 2rem;
                    background: linear-gradient(135deg, #0052e8, #00a8ff);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 24px rgba(0, 82, 232, 0.3);
                }

                .back-to-profile-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 14px 40px rgba(0, 82, 232, 0.4);
                }

                .back-to-profile-btn:active {
                    transform: translateY(-1px);
                }

                @media (max-width: 480px) {
                    .age-restricted-card {
                        padding: 2rem 1.5rem;
                    }

                    .age-restricted-title {
                        font-size: 1.5rem;
                    }

                    .age-restricted-message {
                        font-size: 1rem;
                    }

                    .age-info-value {
                        font-size: 1.5rem;
                    }

                    .age-info-box {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .age-info-divider {
                        display: none;
                    }
                }
            `}</style>
        </AuthAccessLayout>
    );
}
