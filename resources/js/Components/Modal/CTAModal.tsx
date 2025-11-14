import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import './CTAModal.css';

// Login form data type (no client-side validation - backend handles all validation)
interface LoginFormData {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
}

// Registration form data type (no client-side validation - backend handles all validation)
interface RegisterFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface CTAModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export default function CTAModal({
  isOpen,
  onClose,
  initialTab = 'login',
}: CTAModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Login form state
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    emailOrUsername: '',
    password: '',
    rememberMe: false,
  });

  // Register form state
  const [registerFormData, setRegisterFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isOpen, activeTab]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  // Handle login submission
  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);

    router.post(route('auth.login'), loginFormData, {
      onSuccess: () => {
        setSuccessMessage('Login successful! Redirecting...');
        onClose();
      },
      onError: (errors: any) => {
        const errorMessage = errors?.emailOrUsername ||
                            errors?.password ||
                            'Login failed. Please try again.';
        setApiError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
        setIsSubmitting(false);
      },
    });
  };

  // Handle register submission (all validation done by Laravel backend)
  const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);

    router.post(route('auth.register'), registerFormData, {
      onSuccess: () => {
        setSuccessMessage('Account created successfully! Logging you in...');
        setRegisterFormData({
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          password: '',
          password_confirmation: '',
        });

        setTimeout(() => {
          setActiveTab('login');
          setSuccessMessage(null);
          onClose();
        }, 1500);
      },
      onError: (errors: any) => {
        const errorMessage = Object.values(errors)?.[0] ||
                            'Registration failed. Please try again.';
        setApiError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
        setIsSubmitting(false);
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="cta-modal-overlay"
      ref={modalRef}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div className="cta-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-brand">
            <h2>FamTree</h2>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tabs">
          <button
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setApiError(null);
              setSuccessMessage(null);
              setRegisterFormData({
                firstName: '',
                lastName: '',
                username: '',
                email: '',
                password: '',
                password_confirmation: '',
              });
            }}
            type="button"
          >
            Login
          </button>
          <button
            className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('register');
              setApiError(null);
              setSuccessMessage(null);
              setLoginFormData({
                emailOrUsername: '',
                password: '',
                rememberMe: false,
              });
            }}
            type="button"
          >
            Register
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {/* Error Message */}
          {apiError && (
            <div
              className="alert alert-error"
              role="alert"
            >
              {apiError}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              className="alert alert-success"
              role="status"
            >
              {successMessage}
            </div>
          )}

          {/* LOGIN TAB */}
          {activeTab === 'login' && (
            <form
              onSubmit={handleLoginSubmit}
              className="modal-form"
              noValidate
            >
              {/* Email or Username Field */}
              <div className="form-group">
                <label htmlFor="login-emailOrUsername">Email or Username</label>
                <input
                  id="login-emailOrUsername"
                  type="text"
                  placeholder="your@email.com or username"
                  value={loginFormData.emailOrUsername}
                  onChange={(e) =>
                    setLoginFormData({
                      ...loginFormData,
                      emailOrUsername: e.target.value,
                    })
                  }
                  ref={firstInputRef}
                  disabled={isSubmitting}
                />
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginFormData.password}
                    onChange={(e) =>
                      setLoginFormData({
                        ...loginFormData,
                        password: e.target.value,
                      })
                    }
                    disabled={isSubmitting}
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
              </div>

              {/* Remember Me */}
              <div className="form-checkbox">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={loginFormData.rememberMe}
                  onChange={(e) =>
                    setLoginFormData({
                      ...loginFormData,
                      rememberMe: e.target.checked,
                    })
                  }
                  disabled={isSubmitting}
                />
                <label htmlFor="remember-me">Remember me</label>
              </div>

              {/* Forgot Password Link */}
              <a href="#" className="forgot-password-link">
                Forgot password?
              </a>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>

              {/* Footer */}
              <div className="modal-footer">
                <span>Don't have an account?</span>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setActiveTab('register');
                    setApiError(null);
                    setSuccessMessage(null);
                    setLoginFormData({
                      emailOrUsername: '',
                      password: '',
                      rememberMe: false,
                    });
                  }}
                  disabled={isSubmitting}
                >
                  Register here
                </button>
              </div>
            </form>
          )}

          {/* REGISTER TAB */}
          {activeTab === 'register' && (
            <form
              onSubmit={handleRegisterSubmit}
              className="modal-form"
              noValidate
            >
              {/* First Name & Last Name Row */}
              <div className="form-row">
                {/* First Name Field */}
                <div className="form-group form-group-half">
                  <label htmlFor="register-firstName">First Name</label>
                  <input
                    id="register-firstName"
                    type="text"
                    value={registerFormData.firstName}
                    onChange={(e) =>
                      setRegisterFormData({
                        ...registerFormData,
                        firstName: e.target.value,
                      })
                    }
                    placeholder="John"
                    ref={firstInputRef}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Last Name Field */}
                <div className="form-group form-group-half">
                  <label htmlFor="register-lastName">Last Name</label>
                  <input
                    id="register-lastName"
                    type="text"
                    value={registerFormData.lastName}
                    onChange={(e) =>
                      setRegisterFormData({
                        ...registerFormData,
                        lastName: e.target.value,
                      })
                    }
                    placeholder="Doe"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Username Field */}
              <div className="form-group">
                <label htmlFor="register-username">Username</label>
                <input
                  id="register-username"
                  type="text"
                  value={registerFormData.username}
                  onChange={(e) =>
                    setRegisterFormData({
                      ...registerFormData,
                      username: e.target.value,
                    })
                  }
                  placeholder="johndoe123"
                  disabled={isSubmitting}
                />
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="register-email">Email Address</label>
                <input
                  id="register-email"
                  type="email"
                  value={registerFormData.email}
                  onChange={(e) =>
                    setRegisterFormData({
                      ...registerFormData,
                      email: e.target.value,
                    })
                  }
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                />
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="register-password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={registerFormData.password}
                    onChange={(e) =>
                      setRegisterFormData({
                        ...registerFormData,
                        password: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                    disabled={isSubmitting}
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
                <small className="password-hint">
                  Must be 8+ characters with uppercase, lowercase, and number
                </small>
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="register-confirm-password">
                  Confirm Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={registerFormData.password_confirmation}
                    onChange={(e) =>
                      setRegisterFormData({
                        ...registerFormData,
                        password_confirmation: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Footer */}
              <div className="modal-footer">
                <span>Already have an account?</span>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setActiveTab('login');
                    setApiError(null);
                    setSuccessMessage(null);
                  }}
                  disabled={isSubmitting}
                >
                  Login here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
