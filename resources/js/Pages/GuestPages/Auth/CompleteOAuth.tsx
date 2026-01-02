import { useState, useRef, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import '../../../Components/Modal/CTAModal.css'; // Reuse modal styles

// Ziggy route helper is available globally
declare function route(name: string, params?: any): string;

interface OAuthData {
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
}

interface Props {
  oAuthData: OAuthData;
}

export default function CompleteOAuth({ oAuthData }: Props) {
  const { props } = usePage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const firstInputRef = useRef<HTMLSelectElement>(null);

  const [formData, setFormData] = useState({
    gender: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);

    router.post(route('auth.oauth.complete.submit'), formData, {
      onSuccess: () => {
        // Redirect handled by backend
      },
      onError: (errors: any) => {
        const errorMessage = Object.values(errors)?.[0] ||
                            'Failed to complete registration. Please try again.';
        setApiError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
        setIsSubmitting(false);
      },
    });
  };

  return (
    <GuestLayout>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            {/* Card Container */}
            <div className="card shadow-sm">
              <div className="card-body p-4">
                {/* Header */}
                <div className="text-center mb-4">
                  <h2 className="h4 mb-2">Complete Your Registration</h2>
                  <p className="text-muted small">
                    Just a few more details to get started
                  </p>
                </div>

                {/* OAuth User Info Display */}
                <div className="oauth-user-info mb-4 p-3 bg-light rounded">
                  <div className="d-flex align-items-center gap-3">
                    {oAuthData.avatar && (
                      <img
                        src={oAuthData.avatar}
                        alt={`${oAuthData.first_name} ${oAuthData.last_name}`}
                        className="rounded-circle"
                        width="48"
                        height="48"
                      />
                    )}
                    <div>
                      <div className="fw-semibold">
                        {oAuthData.first_name} {oAuthData.last_name}
                      </div>
                      <div className="text-muted small">{oAuthData.email}</div>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {apiError && (
                  <div className="alert alert-danger" role="alert">
                    {apiError}
                  </div>
                )}

                {/* Completion Form */}
                <form onSubmit={handleSubmit} noValidate>
                  {/* Gender Field */}
                  <div className="mb-3">
                    <label htmlFor="gender" className="form-label">
                      Gender <span className="text-danger">*</span>
                    </label>
                    <select
                      id="gender"
                      className="form-select"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      ref={firstInputRef}
                      disabled={isSubmitting}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <div className="form-text">
                      Required for family tree accuracy
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password <span className="text-danger">*</span>
                    </label>
                    <div className="password-input-wrapper position-relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className="form-control"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        disabled={isSubmitting}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    <div className="form-text">
                      Must be 8+ characters with uppercase, lowercase, and number
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="mb-4">
                    <label htmlFor="confirm-password" className="form-label">
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <div className="password-input-wrapper position-relative">
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="form-control"
                        value={formData.password_confirmation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password_confirmation: e.target.value,
                          })
                        }
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        aria-label={
                          showConfirmPassword ? 'Hide password' : 'Show password'
                        }
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  {/* Why Password? Info */}
                  <div className="alert alert-info mb-4">
                    <small>
                      <strong>Why do I need a password?</strong>
                      <br />
                      A password lets you sign in even when Google OAuth is
                      unavailable and provides additional account security.
                    </small>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Completing Registration...
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-4">
                  <p className="text-muted small mb-0">
                    By continuing, you agree to our Terms of Service and Privacy
                    Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
