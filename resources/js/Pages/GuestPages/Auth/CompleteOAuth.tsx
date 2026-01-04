import { useState, useRef, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Eye, EyeOff, Lock, User, Shield, CheckCircle } from 'lucide-react';
import './CompleteOAuth.css';

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
    <div className="oauth-complete-page">
      <div className="oauth-complete-container">
        <div className="oauth-complete-card">
          {/* Logo/Brand Section */}
          <div className="oauth-header">
            <div className="oauth-logo-circle">
              <CheckCircle size={48} className="oauth-logo-icon" />
            </div>
            <h1 className="oauth-title">Complete Your Registration</h1>
            <p className="oauth-subtitle">Just a few more details to get started</p>
          </div>

          {/* OAuth User Info Display */}
          <div className="oauth-user-info">
            <div className="oauth-user-avatar-wrapper">
              {oAuthData.avatar ? (
                <img
                  src={oAuthData.avatar}
                  alt={`${oAuthData.first_name} ${oAuthData.last_name}`}
                  className="oauth-user-avatar"
                />
              ) : (
                <div className="oauth-user-avatar-fallback">
                  <User size={32} />
                </div>
              )}
              <div className="oauth-verified-badge">
                <CheckCircle size={16} />
              </div>
            </div>
            <div className="oauth-user-details">
              <div className="oauth-user-name">
                {oAuthData.first_name} {oAuthData.last_name}
              </div>
              <div className="oauth-user-email">{oAuthData.email}</div>
            </div>
          </div>

          {/* Error Message */}
          {apiError && (
            <div className="oauth-alert oauth-alert-danger">
              <Shield size={18} />
              <span>{apiError}</span>
            </div>
          )}

          {/* Completion Form */}
          <form onSubmit={handleSubmit} noValidate className="oauth-form">
            {/* Gender Field */}
            <div className="oauth-form-group">
              <label htmlFor="gender" className="oauth-label">
                <User size={18} />
                Gender <span className="oauth-required">*</span>
              </label>
              <select
                id="gender"
                className="oauth-select"
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
              <div className="oauth-form-hint">
                Required for family tree accuracy
              </div>
            </div>

            {/* Password Field */}
            <div className="oauth-form-group">
              <label htmlFor="password" className="oauth-label">
                <Lock size={18} />
                Password <span className="oauth-required">*</span>
              </label>
              <div className="oauth-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="oauth-input"
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
                  className="oauth-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="oauth-form-hint">
                Must be 8+ characters with uppercase, lowercase, and number
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="oauth-form-group">
              <label htmlFor="confirm-password" className="oauth-label">
                <Lock size={18} />
                Confirm Password <span className="oauth-required">*</span>
              </label>
              <div className="oauth-input-wrapper">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="oauth-input"
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
                  className="oauth-toggle-btn"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Why Password? Info */}
            <div className="oauth-info-box">
              <Shield size={18} className="oauth-info-icon" />
              <div className="oauth-info-content">
                <strong>Why do I need a password?</strong>
                <p>
                  A password lets you sign in even when Google OAuth is
                  unavailable and provides additional account security.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="oauth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="oauth-spinner"></span>
                  Completing Registration...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Complete Registration
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="oauth-footer">
            <p>
              By continuing, you agree to our <a href="/terms">Terms of Service</a> and{' '}
              <a href="/privacy">Privacy Policy</a>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="oauth-bg-circle oauth-bg-circle-1"></div>
        <div className="oauth-bg-circle oauth-bg-circle-2"></div>
        <div className="oauth-bg-circle oauth-bg-circle-3"></div>
      </div>
    </div>
  );
}
