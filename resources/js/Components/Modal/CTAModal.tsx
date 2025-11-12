import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import './CTAModal.css';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional().default(false),
});

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string(),
  familyName: z.string().optional(),
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
    mode: 'onBlur',
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
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
  const handleLoginSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      // TODO: Connect to actual backend endpoint
      console.log('Login attempt:', data);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccessMessage('Login successful! Redirecting...');
      // TODO: Handle redirect or token storage
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      setApiError('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle register submission
  const handleRegisterSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      // TODO: Connect to actual backend endpoint
      console.log('Register attempt:', data);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccessMessage('Account created successfully! Please check your email.');
      loginForm.reset();
      setTimeout(() => {
        setActiveTab('login');
        setSuccessMessage(null);
      }, 2000);
    } catch (error) {
      setApiError('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
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
              registerForm.reset();
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
              loginForm.reset();
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
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  {...loginForm.register('email')}
                  ref={firstInputRef}
                  disabled={isSubmitting}
                  aria-invalid={loginForm.formState.errors.email ? 'true' : 'false'}
                  aria-describedby={
                    loginForm.formState.errors.email ? 'login-email-error' : undefined
                  }
                />
                {loginForm.formState.errors.email && (
                  <span
                    id="login-email-error"
                    className="form-error"
                    role="alert"
                  >
                    {loginForm.formState.errors.email.message}
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
              {/* Full Name Field */}
              <div className="form-group">
                <label htmlFor="register-name">Full Name</label>
                <input
                  id="register-name"
                  type="text"
                  placeholder="John Doe"
                  {...registerForm.register('fullName')}
                  ref={firstInputRef}
                  disabled={isSubmitting}
                  aria-invalid={
                    registerForm.formState.errors.fullName ? 'true' : 'false'
                  }
                  aria-describedby={
                    registerForm.formState.errors.fullName
                      ? 'register-name-error'
                      : undefined
                  }
                />
                {registerForm.formState.errors.fullName && (
                  <span
                    id="register-name-error"
                    className="form-error"
                    role="alert"
                  >
                    {registerForm.formState.errors.fullName.message}
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
                  Must be 8+ characters with uppercase and number
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

              {/* Family Name Field (Optional) */}
              <div className="form-group">
                <label htmlFor="family-name">Family Name (Optional)</label>
                <input
                  id="family-name"
                  type="text"
                  placeholder="e.g., Okafor Family"
                  {...registerForm.register('familyName')}
                  disabled={isSubmitting}
                />
                <small>You can create or join a family later</small>
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
