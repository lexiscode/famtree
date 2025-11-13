import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { z } from 'zod';
import './CTAModal.css';

// Validation schemas
const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, 'Last name is required').min(2, 'Last name must be at least 2 characters'),
  username: z.string().min(1, 'Username is required').min(3, 'Username must be at least 3 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

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

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
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

  // Handle register submission
  const handleRegisterSubmit = (data: RegisterFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    router.post(route('auth.register'), {
      ...data,
      password_confirmation: data.confirmPassword,
    }, {
      onSuccess: () => {
        setSuccessMessage('Account created successfully! Logging you in...');
        registerForm.reset();

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
              registerForm.reset(undefined, { keepErrors: false, keepDirty: false, keepTouched: false });
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
              loginForm.reset(undefined, { keepErrors: false, keepDirty: false, keepTouched: false });
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
                    loginForm.reset();
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
              onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
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
                    placeholder="John"
                    {...registerForm.register('firstName')}
                    ref={firstInputRef}
                    disabled={isSubmitting}
                    aria-invalid={
                      registerForm.formState.errors.firstName ? 'true' : 'false'
                    }
                    aria-describedby={
                      registerForm.formState.errors.firstName
                        ? 'register-firstName-error'
                        : undefined
                    }
                  />
                  {registerForm.formState.errors.firstName && (
                    <span
                      id="register-firstName-error"
                      className="form-error"
                      role="alert"
                    >
                      {registerForm.formState.errors.firstName.message}
                    </span>
                  )}
                </div>

                {/* Last Name Field */}
                <div className="form-group form-group-half">
                  <label htmlFor="register-lastName">Last Name</label>
                  <input
                    id="register-lastName"
                    type="text"
                    placeholder="Doe"
                    {...registerForm.register('lastName')}
                    disabled={isSubmitting}
                    aria-invalid={
                      registerForm.formState.errors.lastName ? 'true' : 'false'
                    }
                    aria-describedby={
                      registerForm.formState.errors.lastName
                        ? 'register-lastName-error'
                        : undefined
                    }
                  />
                  {registerForm.formState.errors.lastName && (
                    <span
                      id="register-lastName-error"
                      className="form-error"
                      role="alert"
                    >
                      {registerForm.formState.errors.lastName.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Username Field */}
              <div className="form-group">
                <label htmlFor="register-username">Username</label>
                <input
                  id="register-username"
                  type="text"
                  placeholder="johndoe123"
                  {...registerForm.register('username')}
                  disabled={isSubmitting}
                  aria-invalid={
                    registerForm.formState.errors.username ? 'true' : 'false'
                  }
                  aria-describedby={
                    registerForm.formState.errors.username
                      ? 'register-username-error'
                      : undefined
                  }
                />
                {registerForm.formState.errors.username && (
                  <span
                    id="register-username-error"
                    className="form-error"
                    role="alert"
                  >
                    {registerForm.formState.errors.username.message}
                  </span>
                )}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="register-email">Email Address</label>
                <input
                  id="register-email"
                  type="email"
                  placeholder="your@email.com"
                  {...registerForm.register('email')}
                  disabled={isSubmitting}
                  aria-invalid={
                    registerForm.formState.errors.email ? 'true' : 'false'
                  }
                  aria-describedby={
                    registerForm.formState.errors.email
                      ? 'register-email-error'
                      : undefined
                  }
                />
                {registerForm.formState.errors.email && (
                  <span
                    id="register-email-error"
                    className="form-error"
                    role="alert"
                  >
                    {registerForm.formState.errors.email.message}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="register-password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...registerForm.register('password')}
                    disabled={isSubmitting}
                    aria-invalid={
                      registerForm.formState.errors.password ? 'true' : 'false'
                    }
                    aria-describedby={
                      registerForm.formState.errors.password
                        ? 'register-password-error'
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
                {registerForm.formState.errors.password && (
                  <span
                    id="register-password-error"
                    className="form-error"
                    role="alert"
                  >
                    {registerForm.formState.errors.password.message}
                  </span>
                )}
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
                    placeholder="••••••••"
                    {...registerForm.register('confirmPassword')}
                    disabled={isSubmitting}
                    aria-invalid={
                      registerForm.formState.errors.confirmPassword
                        ? 'true'
                        : 'false'
                    }
                    aria-describedby={
                      registerForm.formState.errors.confirmPassword
                        ? 'register-confirm-password-error'
                        : undefined
                    }
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
                {registerForm.formState.errors.confirmPassword && (
                  <span
                    id="register-confirm-password-error"
                    className="form-error"
                    role="alert"
                  >
                    {registerForm.formState.errors.confirmPassword.message}
                  </span>
                )}
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
                    registerForm.reset();
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
