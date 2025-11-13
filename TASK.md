# 📋 DEVELOPMENT TODOS - FAMTREE GUEST PAGES

**This file is your day-to-day development roadmap for building all FamTree guest pages.**

**Last Updated:** November 12, 2025
**Status:** Ready for Implementation


## 🔐 7. Login / Register Modal (Popups)

Accessible from any page.

### (A) Login Modal

* Fields: Email/Username and Password
* Forgot Password link
* CTA: “Login”
* Footer Text: “New here? Create an account.” → Switches to Register modal

### (B) Register Modal

* Fields: First Name | Last Name | Username | Email | Password | Confirm Password
* CTA: “Create Account”
* Footer Text: “Already have an account? Log in.” → Switches to Login modal

*Optional later:* Add **social logins** (Google / Facebook / Apple)



### Shared Component: CTAModal (Login/Register)

**File:** `resources/js/Components/Modal/CTAModal.tsx`

**This is a complex component - build in multiple steps**

- [ ] **1.13: Create modal structure & backdrop**
  - [ ] Create component with TypeScript interface:
    ```typescript
    interface CTAModalProps {
      isOpen: boolean;
      onClose: () => void;
      initialTab?: 'login' | 'register';
    }
    ```
  - [ ] Modal backdrop (semi-transparent, clickable to close)
  - [ ] Modal body (white card, centered)
  - [ ] Modal header (close button, FamTree logo)
  - [ ] Tab switcher (Login | Register buttons)
  - [ ] Tab content area

- [ ] **1.14: Implement Login tab**
  - [ ] Form fields:
    - [ ] Email/Username input 
    - [ ] Password input (type='password', with visibility toggle)
    - [ ] Remember me checkbox (optional)
  - [ ] Links:
    - [ ] "Forgot password?" link
    - [ ] "Don't have an account? Register" link
  - [ ] Submit button: "Login"
  - [ ] Error message display area
  - [ ] Loading state during submission

- [ ] **1.15: Implement Register tab**
  - [ ] Form fields:
    - [ ] First Name input
    - [ ] Last Name input
    - [ ] Username input
    - [ ] Email input
    - [ ] Password input (with strength indicator)
    - [ ] Confirm Password input
    - [ ] Family Name dropdown (optional, can fetch from backend)
  - [ ] Links:
    - [ ] "Already have account? Login" link
  - [ ] Submit button: "Create Account"
  - [ ] Error message display area
  - [ ] Loading state during submission
  - [ ] Success message (redirect after register)

- [ ] **1.16: Add form validation (client-side)**
  - [ ] Use react-hook-form for state management
  - [ ] Use zod for schema validation
  - [ ] Validation rules:
    - [ ] Email: valid email format
    - [ ] Password: min 8 chars, uppercase, lowercase, number
    - [ ] Confirm password: must match password
    - [ ] Full name: not empty
  - [ ] Show validation errors below fields
  - [ ] Real-time validation feedback

- [ ] **1.17: Add modal interactions**
  - [ ] Close button (X) in header
  - [ ] Close on backdrop click
  - [ ] Close on Escape key (listen to KeyboardEvent)
  - [ ] Tab switching animation (fade-in/out)
  - [ ] Focus management:
    - [ ] Focus first input when modal opens
    - [ ] Focus trap (Tab cycles through inputs, not beyond modal)
    - [ ] Return focus to trigger button when closed

- [ ] **1.18: Connect to backend (placeholder)**
  - [ ] Create action handlers:
    ```typescript
    const handleLogin = async (data) => { /* submit to /login */ }
    const handleRegister = async (data) => { /* submit to /register */ }
    ```
  - [ ] Add loading state (disable button, show spinner)
  - [ ] Handle errors (show error message)
  - [ ] Handle success (show success message, redirect)
  - [ ] Note: Backend routes will be created in phase 2

- [ ] **1.19: Style modal**
  - [ ] White background (white/cream)
  - [ ] Box shadow for depth
  - [ ] Border-radius: 12px
  - [ ] Responsive width (90% on mobile, 500px on desktop)
  - [ ] Smooth animations (fade-in backdrop, scale modal)
  - [ ] Dark theme on backdrop (rgba(0,0,0,0.5))

- [ ] **1.20: Test CTAModal**
  - [ ] Modal opens/closes correctly
  - [ ] Tab switching works
  - [ ] Form validation shows errors
  - [ ] Fields focus correctly
  - [ ] Keyboard navigation (Tab, Escape)
  - [ ] Backdrop click closes modal
  - [ ] Mobile: full-width responsive layout
  - [ ] Accessibility: ARIA roles, labels
