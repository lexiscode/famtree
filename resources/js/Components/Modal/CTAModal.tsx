import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import './CTAModal.css';

// Ziggy route helper is available globally
declare function route(name: string, params?: any): string;

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
  gender: string;
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
    gender: '',
    password: '',
    password_confirmation: '',
  });

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isOpen, activeTab]);

  // Lock body scroll when modal is open and clear messages
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Clear any old messages when modal opens
      setApiError(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle login submission
  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    router.post(route('auth.login'), loginFormData, {
      onSuccess: (page: any) => {
        // Check if there's a flash error message (login failed)
        const flashError = page.props?.flash?.error;

        if (flashError) {
          // Login failed, show error message
          setApiError(flashError);
        } else {
          // Login succeeded - show message and force full page reload
          setSuccessMessage('Login successful! Redirecting...');

          // Force a full page reload to the home page after a short delay
          setTimeout(() => {
            window.location.href = route('home');
          }, 800);
        }
      },
      onError: (errors: any) => {
        // Handle validation errors
        const errorMessage = errors?.emailOrUsername ||
                            errors?.password ||
                            'Login failed. Please try again.';
        setApiError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
      },
      onFinish: () => {
        // Always reset submitting state when request finishes
        setIsSubmitting(false);
      },
    });
  };

  // Handle register submission (all validation done by Laravel backend)
  const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    router.post(route('auth.register'), registerFormData, {
      onSuccess: (page: any) => {
        // Check if there's a flash error message (registration failed)
        const flashError = page.props?.flash?.error;

        if (flashError) {
          // Registration failed, show error message
          setApiError(flashError);
        } else {
          // Registration succeeded - show message and force full page reload
          setSuccessMessage('Account created successfully! Logging you in...');
          setRegisterFormData({
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            gender: '',
            password: '',
            password_confirmation: '',
          });

          // Force a full page reload to the home page after a short delay
          setTimeout(() => {
            window.location.href = route('home');
          }, 1200);
        }
      },
      onError: (errors: any) => {
        // Handle validation errors
        const errorMessage = Object.values(errors)?.[0] ||
                            'Registration failed. Please try again.';
        setApiError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
      },
      onFinish: () => {
        // Always reset submitting state when request finishes
        setIsSubmitting(false);
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="cta-modal-overlay"
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
                gender: '',
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

              {/* OAuth Divider */}
              <div className="oauth-divider">
                <span>or</span>
              </div>

              {/* Google OAuth Button */}
              <a
                href={route('auth.google')}
                className="btn btn-google btn-lg"
                aria-label="Sign in with Google"
              >
                <svg
                  className="google-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
                  />
                  <path
                    fill="#EA4335"
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                  />
                </svg>
                Sign in with Google
              </a>

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

              {/* Gender Field */}
              <div className="form-group">
                <label htmlFor="register-gender">Gender *</label>
                <select
                  id="register-gender"
                  value={registerFormData.gender}
                  onChange={(e) =>
                    setRegisterFormData({
                      ...registerFormData,
                      gender: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
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

              {apiError && apiError.includes('reserved') && (
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <a
                    href="/claim-username"
                    style={{ color: '#fbbf24', fontWeight: 600, fontSize: 14, textDecoration: 'underline' }}
                  >
                    Are you the rightful owner? Submit a claim request
                  </a>
                </div>
              )}

              {/* OAuth Divider */}
              <div className="oauth-divider">
                <span>or</span>
              </div>

              {/* Google OAuth Button */}
              <a
                href={route('auth.google')}
                className="btn btn-google btn-lg"
                aria-label="Sign up with Google"
              >
                <svg
                  className="google-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
                  />
                  <path
                    fill="#EA4335"
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                  />
                </svg>
                Sign up with Google
              </a>

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
