import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { z } from 'zod';
import './CTAModal.css';

// Validation schema for login only (keep Zod validation for login)
const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Registration form data type (no Zod validation - backend handles all validation)
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

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: {
      emailOrUsername: '',
      password: '',
      rememberMe: false,
    },
  });

  // Register form (no client-side validation - backend handles all validation)
  const registerForm = useForm<RegisterFormData>({
    mode: 'onSubmit',
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
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
  const handleLoginSubmit = (data: LoginFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    router.post(route('auth.login'), data, {
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
  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);

    // Get form data directly without any client-side validation
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    router.post(route('auth.register'), data, {
      onSuccess: () => {
        setSuccessMessage('Account created successfully! Logging you in...');
        registerForm.reset({
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
              registerForm.reset({
                firstName: '',
                lastName: '',
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
              }, { keepErrors: false, keepDirty: false, keepTouched: false });
              loginForm.clearErrors();
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
              loginForm.reset({
                emailOrUsername: '',
                password: '',
                rememberMe: false,
              }, { keepErrors: false, keepDirty: false, keepTouched: false });
              registerForm.clearErrors();
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
              onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
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
                  {...loginForm.register('emailOrUsername')}
                  ref={firstInputRef}
                  disabled={isSubmitting}
                  aria-invalid={loginForm.formState.errors.emailOrUsername ? 'true' : 'false'}
                  aria-describedby={
                    loginForm.formState.errors.emailOrUsername ? 'login-emailOrUsername-error' : undefined
                  }
                />
                {loginForm.formState.errors.emailOrUsername && (
                  <span
                    id="login-emailOrUsername-error"
                    className="form-error"
                    role="alert"
                  >
                    {loginForm.formState.errors.emailOrUsername.message}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...loginForm.register('password')}
                    disabled={isSubmitting}
                    aria-invalid={
                      loginForm.formState.errors.password ? 'true' : 'false'
                    }
                    aria-describedby={
                      loginForm.formState.errors.password
                        ? 'login-password-error'
                        : undefined
                    }
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
                {loginForm.formState.errors.password && (
                  <span
                    id="login-password-error"
                    className="form-error"
                    role="alert"
                  >
                    {loginForm.formState.errors.password.message}
                  </span>
                )}
              </div>

              {/* Remember Me */}
              <div className="form-checkbox">
                <input
                  id="remember-me"
                  type="checkbox"
                  {...loginForm.register('rememberMe')}
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
                    loginForm.reset({
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
                    name="firstName"
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
                    name="lastName"
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
                  name="username"
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
                  name="email"
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
                    name="password"
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
                    name="password_confirmation"
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
