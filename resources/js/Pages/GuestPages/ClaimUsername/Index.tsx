import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import HomeHeader from '@/Components/Navigation/HomeHeader';
import FloatingNavDock from '@/Components/Navigation/FloatingNavDock';
import FloatingSocialDock from '@/Components/Navigation/FloatingSocialDock';
import './ClaimUsername.css';

export default function Index() {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [submitted, setSubmitted] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        full_name: '',
        email: '',
        social_media_url: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('claim-username.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setSubmitted(true);
                reset();
            },
        });
    };

    const steps = [
        { num: '1', title: 'Submit Request', desc: 'Fill out the form with your details' },
        { num: '2', title: 'Receive Code', desc: 'We\'ll email you a verification code' },
        { num: '3', title: 'Post Code', desc: 'Post it on your verified social media' },
        { num: '4', title: 'Get Verified', desc: 'We confirm and assign the username' },
    ];

    return (
        <GuestLayout hideFooter hideNavigation>
            <Head title="Claim Reserved Username - FamTree" />

            <HomeHeader />
            <FloatingNavDock />
            <FloatingSocialDock />

            <section className="claim-hero">
                <div className="claim-hero-content">
                    {/* Header */}
                    <div className="claim-header">
                        <div className="claim-badge">
                            <i className="bi-shield-check"></i>
                            <span>Identity Verification</span>
                        </div>

                        <h1 className="claim-title">
                            Claim Your <span className="gradient-text">Reserved Username</span>
                        </h1>

                        <p className="claim-subtitle">
                            If you're a public figure and your username has been reserved on FamTree,
                            submit a claim request and we'll verify your identity.
                        </p>
                    </div>

                    {/* Steps */}
                    {!submitted && (
                        <div className="claim-steps">
                            {steps.map((step) => (
                                <div key={step.num} className="claim-step">
                                    <div className="claim-step-num">{step.num}</div>
                                    <h4>{step.title}</h4>
                                    <p>{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Success State */}
                    {submitted && flash?.success ? (
                        <div className="claim-success-card">
                            <div className="claim-success-icon">
                                <i className="bi-check-lg"></i>
                            </div>
                            <h3>Request Submitted!</h3>
                            <p>{flash.success}</p>
                            <button
                                className="claim-success-btn"
                                onClick={() => setSubmitted(false)}
                            >
                                <i className="bi-plus-circle"></i>
                                Submit Another Request
                            </button>
                        </div>
                    ) : !submitted && (
                        <div className="claim-form-card">
                            <h2 className="claim-form-title">Claim Request Form</h2>

                            <form onSubmit={handleSubmit}>
                                <div className="claim-field">
                                    <label>
                                        Reserved Username <span className="required">*</span>
                                    </label>
                                    <div className="claim-input-group">
                                        <span className="claim-input-prefix">@</span>
                                        <input
                                            type="text"
                                            className={`claim-input ${errors.username ? 'error' : ''}`}
                                            placeholder="e.g. wizkid"
                                            value={data.username}
                                            onChange={(e) => setData('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                                        />
                                    </div>
                                    {errors.username && <div className="claim-field-error">{errors.username}</div>}
                                    <div className="claim-field-hint">The username you'd like to claim on FamTree</div>
                                </div>

                                <div className="claim-field">
                                    <label>
                                        Full Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`claim-input ${errors.full_name ? 'error' : ''}`}
                                        placeholder="Your real full name"
                                        value={data.full_name}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                    />
                                    {errors.full_name && <div className="claim-field-error">{errors.full_name}</div>}
                                </div>

                                <div className="claim-field">
                                    <label>
                                        Email Address <span className="required">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className={`claim-input ${errors.email ? 'error' : ''}`}
                                        placeholder="your@email.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    {errors.email && <div className="claim-field-error">{errors.email}</div>}
                                    <div className="claim-field-hint">We'll send the verification code to this email</div>
                                </div>

                                <div className="claim-field">
                                    <label>
                                        Verified Social Media Profile <span className="required">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        className={`claim-input ${errors.social_media_url ? 'error' : ''}`}
                                        placeholder="https://instagram.com/yourusername"
                                        value={data.social_media_url}
                                        onChange={(e) => setData('social_media_url', e.target.value)}
                                    />
                                    {errors.social_media_url && <div className="claim-field-error">{errors.social_media_url}</div>}
                                    <div className="claim-field-hint">Link to your verified Instagram, Twitter/X, or other official profile</div>
                                </div>

<button
                                    type="submit"
                                    className="claim-submit-btn"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <span className="claim-spinner" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi-send-fill"></i>
                                            Submit Claim Request
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Background decoration */}
                <div className="claim-background">
                    <div className="claim-bg-shape claim-shape-1"></div>
                    <div className="claim-bg-shape claim-shape-2"></div>
                    <div className="claim-bg-shape claim-shape-3"></div>
                </div>
            </section>
        </GuestLayout>
    );
}
