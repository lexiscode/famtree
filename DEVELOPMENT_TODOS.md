# 📋 DEVELOPMENT TODOS - FAMTREE GUEST PAGES

**This file is your day-to-day development roadmap for building all FamTree guest pages.**

**Last Updated:** November 12, 2025
**Status:** Ready for Implementation

---

## 🎯 QUICK START CHECKLIST

Before you begin any page development:

- [ ] Read PROJECT_STARTUP.md completely (done ✓)
- [ ] Read IMPLEMENTATION_PLAN.md completely (done ✓)
- [ ] Set up design system (colors, typography, spacing)
- [ ] Create shared components (Navigation, Footer, CTAModal)
- [ ] Test routing between all planned pages
- [ ] Set up Tailwind CSS utility classes (OR use Bootstrap classes)

---

## 🚀 PHASE 1: FOUNDATION & SHARED COMPONENTS (Week 1)

### Setup & Configuration

- [ ] **1.1: Install additional npm packages**
  - [ ] `npm install lottie-react react-intersection-observer react-hook-form zod react-helmet-async`
  - [ ] Verify all packages installed: `npm list`
  - [ ] Update imports in app.tsx if needed

- [ ] **1.2: Create CSS/SCSS variable system**
  - [ ] Create `/resources/css/variables.css` with:
    - [ ] Color variables (gold, blue, brown, cream, etc.)
    - [ ] Typography variables (font-sizes, line-heights)
    - [ ] Spacing variables (margin/padding scale 4px base)
    - [ ] Shadow definitions (soft, medium, hard)
    - [ ] Border-radius system
  - [ ] Import in `/resources/css/app.css`
  - [ ] Test variables work in a test component

- [ ] **1.3: Import brand fonts**
  - [ ] Add Playfair Display (serif) from Google Fonts
  - [ ] Add Inter (sans-serif) from Google Fonts
  - [ ] Add Poppins (friendly) from Google Fonts
  - [ ] Set as font-family in app.css
  - [ ] Test on all pages

- [ ] **1.4: Global styling setup**
  - [ ] Create `/resources/css/globals.css` with:
    - [ ] Reset/normalize styles
    - [ ] Default body styles
    - [ ] Link styles
    - [ ] Button base styles
  - [ ] Create button variants (primary, secondary, outline)
  - [ ] Create card component styles
  - [ ] Test on mock page

---

### Shared Component: NavigationBar

**File:** `resources/js/Components/Navigation/NavigationBar.tsx`

- [ ] **1.5: Create NavigationBar structure**
  - [ ] Create component file
  - [ ] Define TypeScript interface for props (if any)
  - [ ] Desktop navigation structure (flex row):
    - [ ] Logo/brand on left
    - [ ] Menu items (Home, About, Features, How It Works, Blog, Contact, Families)
    - [ ] Right side: Login/Register buttons
  - [ ] Mobile hamburger menu (hidden on desktop)
  - [ ] Responsive design: hide full menu on <768px, show hamburger

- [ ] **1.6: Implement NavigationBar styling**
  - [ ] Use color variables for background/text
  - [ ] Add sticky positioning (top: 0, z-index: 1000)
  - [ ] Transparent background initially
  - [ ] Solid background on scroll (use onScroll event listener)
  - [ ] Add padding/margins using spacing system
  - [ ] Hover effects on menu items (gold underline)

- [ ] **1.7: Add navigation interactivity**
  - [ ] Use Inertia `useRoute()` and `Link` for routing
  - [ ] Active route highlighting (add 'active' class to current route item)
  - [ ] Mobile menu toggle state:
    - [ ] Create useState for isMenuOpen
    - [ ] Toggle on hamburger click
    - [ ] Close on menu item click
    - [ ] Close on Escape key press
  - [ ] Smooth transitions between states

- [ ] **1.8: Test NavigationBar**
  - [ ] Desktop view: all menu items visible and functional
  - [ ] Tablet view: hamburger appears at 768px breakpoint
  - [ ] Mobile view: menu collapses, hamburger works
  - [ ] Active route highlighting works
  - [ ] Sticky behavior on scroll
  - [ ] Keyboard navigation (Tab through items, Enter to click)
  - [ ] Accessibility: ARIA labels, proper semantic HTML

---

### Shared Component: Footer

**File:** `resources/js/Components/Footer/Footer.tsx`

- [ ] **1.9: Create Footer structure**
  - [ ] Top section (3-4 columns):
    - [ ] Logo + tagline
    - [ ] Quick Links: Home, About, Features, Contact, Blog
    - [ ] Resources: FAQ, Privacy, Terms, Accessibility
    - [ ] Social: Twitter, Facebook, Instagram, LinkedIn
  - [ ] Bottom section:
    - [ ] Copyright © FamTree 2025
    - [ ] Back-to-top button (floats on scroll, mobile only)

- [ ] **1.10: Style Footer**
  - [ ] Dark background (deep blue #1B3A52)
  - [ ] Light text (white, high contrast)
  - [ ] Grid layout (4 columns on desktop, 2 on tablet, 1 on mobile)
  - [ ] Spacing and padding using system
  - [ ] Social icon hover effects (color change to gold)

- [ ] **1.11: Footer functionality**
  - [ ] Links use Inertia routing
  - [ ] Back-to-top button scrolls to top smoothly (window.scrollTo)
  - [ ] Show/hide back-to-top based on scroll position
  - [ ] Newsletter signup form (optional, can be deferred)

- [ ] **1.12: Test Footer**
  - [ ] All links work
  - [ ] Responsive grid layout
  - [ ] Social icons accessible
  - [ ] Back-to-top button functional on mobile

---

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
    - [ ] Email input (type='email')
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
    - [ ] Full Name input
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

---

### Routes & Controllers Setup

- [ ] **1.21: Define all routes in routes/web.php**
  ```php
  Route::get('/', [HomeController::class, 'index'])->name('home');
  Route::get('/about', [AboutController::class, 'index'])->name('about');
  Route::get('/features', [FeaturesController::class, 'index'])->name('features');
  Route::get('/how-it-works', [HowItWorksController::class, 'index'])->name('how-it-works');
  Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
  Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.show');
  Route::get('/contact', [ContactController::class, 'index'])->name('contact');
  Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
  Route::get('/families', [FamilyExplorerController::class, 'index'])->name('families.index');
  Route::get('/families/{slug}', [FamilyPreviewController::class, 'show'])->name('families.show');
  ```

- [ ] **1.22: Create GuestControllers (stubs)**
  - [ ] `app/Http/Controllers/GuestControllers/HomeController.php` (stub)
  - [ ] `app/Http/Controllers/GuestControllers/AboutController.php` (stub)
  - [ ] `app/Http/Controllers/GuestControllers/FeaturesController.php` (stub)
  - [ ] `app/Http/Controllers/GuestControllers/HowItWorksController.php` (stub)
  - [ ] `app/Http/Controllers/GuestControllers/BlogController.php` (stub)
  - [ ] `app/Http/Controllers/GuestControllers/ContactController.php` (stub)
  - [ ] `app/Http/Controllers/GuestControllers/FamilyExplorerController.php` (stub)
  - [ ] `app/Http/Controllers/GuestControllers/FamilyPreviewController.php` (stub)
  - [ ] Each controller has index/show method returning Inertia::render('GuestPages/...')

- [ ] **1.23: Test routing**
  - [ ] Start Laravel dev server: `./sail artisan serve`
  - [ ] Start Vite dev server: `./sail npm run dev`
  - [ ] Visit http://localhost
  - [ ] Navigate to each route (/ /about /features /how-it-works /blog /contact /families)
  - [ ] All routes load without errors
  - [ ] Breadcrumb navigation works (using Link component)

---

## 🏠 PHASE 2: CORE PAGES - HOME (Week 2)

### Home Page Planning

**File:** `resources/js/Pages/GuestPages/Home/Index.tsx`

**Sections:**
1. HeroSection (background animation, headline, CTAs)
2. MissionSection (About the mission)
3. HowItWorksSection (3-step flow)
4. FamilyShowcaseSection (sample families carousel)
5. FeaturesGridSection (6 feature cards)
6. TestimonialsSection (family testimonials)
7. CTAFooterSection (final CTA banner)

---

### Home - Section 1: HeroSection

**File:** `resources/js/Pages/GuestPages/Home/sections/HeroSection.tsx`

- [ ] **2.1: Create HeroSection component**
  - [ ] Props: none needed for now
  - [ ] Return JSX with hero container, headline, subheading, CTA buttons

- [ ] **2.2: Add hero background animation**
  - [ ] Option A: Lottie JSON animation (RECOMMENDED)
    - [ ] Find or create Lottie animation of interconnecting family nodes
    - [ ] Import lottie-react
    - [ ] Load JSON: `import animationData from '@/animations/family-network.json'`
    - [ ] Render: `<Lottie animationData={animationData} />`
    - [ ] Set loop, autoplay, maintainAspectRatio
  - [ ] Option B: CSS-only (fallback)
    - [ ] Gradient background (#D4A574 → #1B3A52)
    - [ ] Subtle animated particles (CSS keyframes)

- [ ] **2.3: Style HeroSection**
  - [ ] Full-width container (width: 100vw, height: 80-90vh)
  - [ ] Flex layout (center content)
  - [ ] Headline: Playfair Display, 3rem, gold/dark blue
  - [ ] Subheading: Inter, 1.25rem, secondary text color
  - [ ] CTA buttons: Primary (gold) and Secondary (outline)
  - [ ] Responsive: adjust text sizes for mobile

- [ ] **2.4: Add hero CTAs**
  - [ ] Primary button: "Create Your Family Space"
    - [ ] onClick: open CTAModal with register tab
  - [ ] Secondary button: "Explore Families"
    - [ ] onClick: navigate to /families

- [ ] **2.5: Test HeroSection**
  - [ ] Component renders
  - [ ] Animation plays (or gradient displays)
  - [ ] Buttons are clickable
  - [ ] Responsive on mobile (text readable, buttons accessible)

---

### Home - Section 2: MissionSection

**File:** `resources/js/Pages/GuestPages/Home/sections/MissionSection.tsx`

- [ ] **2.6: Create MissionSection component**
  - [ ] Title: "Every Family Has a Story — We Help You Keep It Alive."
  - [ ] Description text (from PROJECT_STARTUP.md)
  - [ ] Optional: small illustration or decorative image on right

- [ ] **2.7: Style MissionSection**
  - [ ] Container: max-width 1200px, centered, padding 64px 24px
  - [ ] Two-column layout (text left, image right; stack on mobile)
  - [ ] Text: Inter font, 1rem line-height 1.6
  - [ ] Heading: Playfair Display, 2.5rem
  - [ ] Background: Light cream or white

- [ ] **2.8: Add scroll animation**
  - [ ] Use react-intersection-observer
  - [ ] Fade-in + slide-up animation as section comes into view
  - [ ] Smooth 400ms transition

---

### Home - Section 3: HowItWorksSection

**File:** `resources/js/Pages/GuestPages/Home/sections/HowItWorksSection.tsx`

- [ ] **2.9: Create HowItWorksSection with 3-step cards**
  - [ ] Step 1: "Create your family account" + "Add your first few relatives."
  - [ ] Step 2: "Connect & expand" + "Add extended family, link in-laws, build history."
  - [ ] Step 3: "Preserve & share" + "Celebrate birthdays, post stories, and keep legacies alive."
  - [ ] CTA: "See Full Demo →" (link to /how-it-works)

- [ ] **2.10: Create StepCard sub-component**
  - [ ] Props: number, title, description, icon
  - [ ] Step number: large, gold, bold
  - [ ] Title: Poppins font, 1.5rem
  - [ ] Description: Inter, 1rem
  - [ ] Icon: lucide-react or bootstrap-icons, 48px

- [ ] **2.11: Style HowItWorksSection**
  - [ ] Container: max-width 1200px, padding 64px 24px
  - [ ] Heading: Playfair Display, 2.5rem, center-aligned
  - [ ] Cards grid: 3 columns (desktop), 1 column (mobile)
  - [ ] Card styling: white bg, shadow, border-radius 12px, padding 32px
  - [ ] Flex layout for step card (icon top, content below)

- [ ] **2.12: Add animations**
  - [ ] Scroll reveal: cards fade-in and slide-up on scroll
  - [ ] Hover effect: card lifts (shadow grows, translateY -5px)

---

### Home - Section 4: FamilyShowcaseSection

**File:** `resources/js/Pages/GuestPages/Home/sections/FamilyShowcaseSection.tsx`

- [ ] **2.13: Create FamilyShowcaseSection**
  - [ ] Heading: "From Lagos to Enugu — Families Everywhere Are Reconnecting."
  - [ ] Carousel of family cards (4-6 visible)
  - [ ] Social proof: "Over 5,000 families are already preserving their roots."
  - [ ] CTA: "Explore Public Families" → /families

- [ ] **2.14: Create FamilyCard sub-component**
  - [ ] Props: family (id, name, state, founder, memberCount, coverImage)
  - [ ] Display: cover image, family name, state/LGA, member count
  - [ ] Blur effect on hover (privacy)
  - [ ] "View Family" button overlay on hover

- [ ] **2.15: Implement carousel**
  - [ ] Use react-slick (already in dependencies)
  - [ ] Settings:
    - [ ] Show 4 cards on desktop, 2 on tablet, 1 on mobile
    - [ ] Slide 1 card per action
    - [ ] Infinite loop
    - [ ] Auto-play (5s interval)
    - [ ] Manual prev/next arrows
  - [ ] Dots/pagination below carousel

- [ ] **2.16: Add sample data**
  - [ ] For now, hardcode 5-6 family objects
  - [ ] Later, fetch from FamilyService

- [ ] **2.17: Test FamilyShowcaseSection**
  - [ ] Carousel displays
  - [ ] Auto-play works
  - [ ] Next/prev buttons functional
  - [ ] Responsive layout

---

### Home - Section 5: FeaturesGridSection

**File:** `resources/js/Pages/GuestPages/Home/sections/FeaturesGridSection.tsx`

- [ ] **2.18: Create FeaturesGridSection**
  - [ ] Heading: "Core Features Snapshot"
  - [ ] 6 feature cards in 3x2 grid:
    1. 🧬 Family Link Engine
    2. 💍 Marriage & In-Law Mapping
    3. 🕊️ Memorial & Legacy Vault
    4. 🗓️ Family Events Calendar
    5. 💬 Private Family Feed
    6. 📍 Ancestral Map
  - [ ] CTA: "View All Features" → /features

- [ ] **2.19: Create FeatureCard sub-component**
  - [ ] Props: icon (emoji or React component), title, description
  - [ ] Icon: 48x48px, centered
  - [ ] Title: Poppins, 1.25rem
  - [ ] Description: Inter, 1rem, light gray

- [ ] **2.20: Style feature grid**
  - [ ] 3 columns (desktop), 2 (tablet), 1 (mobile)
  - [ ] Equal heights
  - [ ] Spacing: 24px gap
  - [ ] Card styling: white bg, shadow, border-radius 12px, padding 32px
  - [ ] Center all content

- [ ] **2.21: Add interactions**
  - [ ] Hover: card scales slightly (transform: scale(1.05))
  - [ ] Hover: shadow increases
  - [ ] Smooth transition (300ms)

---

### Home - Section 6: TestimonialsSection

**File:** `resources/js/Pages/GuestPages/Home/sections/TestimonialsSection.tsx`

- [ ] **2.22: Create TestimonialsSection**
  - [ ] Heading: "Family Stories"
  - [ ] Display 3-5 testimonials in carousel or rotating view
  - [ ] Each testimonial:
    - [ ] Quote text
    - [ ] Author name
    - [ ] Author location (city)
  - [ ] Dots pagination (show which testimonial active)

- [ ] **2.23: Create TestimonialCard sub-component**
  - [ ] Props: quote, author, location
  - [ ] Quote text: italic, large (1.25rem)
  - [ ] Author: bold, Poppins font
  - [ ] Location: secondary text color

- [ ] **2.24: Implement carousel (rotating)**
  - [ ] Auto-rotate every 6s
  - [ ] Fade-in/out transition (400ms)
  - [ ] Manual dots to jump to testimonial

- [ ] **2.25: Add sample testimonials**
  - [ ] At least 5 testimonials (hardcoded)
  - [ ] From PROJECT_STARTUP.md:
    > "I never knew how connected we were until FamTree. Now our children can see their lineage clearly." — Chinonso Okafor, Lagos

- [ ] **2.26: Style testimonial section**
  - [ ] Dark background (deep blue) with white text
  - [ ] Large quote mark (decorative, very light color)
  - [ ] Centered content
  - [ ] Padding: 64px 24px

---

### Home - Section 7: CTAFooterSection

**File:** `resources/js/Pages/GuestPages/Home/sections/CTAFooterSection.tsx`

- [ ] **2.27: Create CTAFooterSection**
  - [ ] Heading: "It's time your family story was told."
  - [ ] Description: Optional supporting text
  - [ ] CTA button: "Start Building Your Family Space →"
    - [ ] onClick: open CTAModal with register tab
  - [ ] Decorative background (subtle gradient or pattern)

- [ ] **2.28: Style CTA section**
  - [ ] Full-width, tall (300px+)
  - [ ] Gold/gradient background or light with gold accent
  - [ ] White text
  - [ ] Centered content
  - [ ] Button: large, primary style

---

### Home Page Integration

- [ ] **2.29: Assemble Home/Index.tsx**
  - [ ] Import all section components
  - [ ] Arrange in order: Hero, Mission, HowItWorks, Showcase, Features, Testimonials, CTA
  - [ ] Layout structure (no sections nested incorrectly)
  - [ ] Pass any needed data as props

- [ ] **2.30: Add page-level animations**
  - [ ] Page fade-in on load (300ms)
  - [ ] Scroll reveal for multiple sections
  - [ ] Parallax on hero background

- [ ] **2.31: Add SEO meta tags**
  - [ ] Use react-helmet-async
  - [ ] Title: "FamTree - Reconnecting Generations, Preserving Family Roots"
  - [ ] Meta description: (compelling summary)
  - [ ] Open Graph tags (og:title, og:description, og:image)
  - [ ] Canonical URL: https://famtree.com

- [ ] **2.32: Test Home page end-to-end**
  - [ ] All sections render
  - [ ] Navigation bar visible and functional
  - [ ] CTAs open modals/navigate correctly
  - [ ] Responsive on mobile, tablet, desktop
  - [ ] Animations smooth
  - [ ] No console errors

---

## 📄 PHASE 3: CORE PAGES - ABOUT, FEATURES, HOW IT WORKS (Week 2-3)

### About Page

**File:** `resources/js/Pages/GuestPages/About/Index.tsx`

- [ ] **3.1: Create About page structure**
  - [ ] PageHeader (title, breadcrumb)
  - [ ] MissionSection (Our Mission)
  - [ ] StorySection (Why It Matters)
  - [ ] VisionSection (Vision 2030)
  - [ ] TeamSection (Team members)
  - [ ] CTASection (Join the Movement)

- [ ] **3.2: Implement MissionSection**
  - [ ] Title + description
  - [ ] Icon or illustration
  - [ ] Styling: text + image side-by-side (desktop), stacked (mobile)

- [ ] **3.3: Implement StorySection**
  - [ ] Emotional narrative about family disconnection
  - [ ] Why FamTree was created
  - [ ] Centered, large text
  - [ ] Background: cream or light

- [ ] **3.4: Implement VisionSection**
  - [ ] Title: "Vision 2030"
  - [ ] Description: "To become Africa's largest digital family heritage map"
  - [ ] Optional: Timeline visualization (hardcoded milestones)

- [ ] **3.5: Implement TeamSection**
  - [ ] Team members grid (1-4 per row depending on screen)
  - [ ] Create TeamCard sub-component:
    - [ ] Photo, name, role, short bio
    - [ ] Social links (optional)
  - [ ] Hardcode team data for now
  - [ ] Later: fetch from backend

- [ ] **3.6: Implement CTASection**
  - [ ] "Join the Movement"
  - [ ] Button: "Register Now" → CTAModal

- [ ] **3.7: Add page styling**
  - [ ] Color scheme: mix of sections (light backgrounds, dark accents)
  - [ ] Typography hierarchy clear
  - [ ] Responsive layout

- [ ] **3.8: Add animations**
  - [ ] Scroll reveals for sections
  - [ ] Team photo fade-in on scroll

- [ ] **3.9: Add SEO**
  - [ ] Title: "About FamTree - Our Mission & Team"
  - [ ] Meta description
  - [ ] Open Graph tags

---

### Features Page

**File:** `resources/js/Pages/GuestPages/Features/Index.tsx`

- [ ] **3.10: Create Features page structure**
  - [ ] PageHeader (title)
  - [ ] FamilyCreationSection (3 feature cards)
  - [ ] MarriageLinksSection (2 feature cards)
  - [ ] LegacyPreservationSection (4 feature cards)
  - [ ] SocialEventsSection (3 feature cards)
  - [ ] CTASection ("See How Families...")

- [ ] **3.11: Create FeatureDetailCard component**
  - [ ] Props: icon, title, description, details (array)
  - [ ] Icon: large (64px)
  - [ ] Title: Poppins, 1.5rem
  - [ ] Description: Inter, 1rem
  - [ ] Optional: bullet list of features
  - [ ] Optional: expandable (click to see more)

- [ ] **3.12: Implement FamilyCreationSection**
  - [ ] 3 cards:
    1. Create digital family spaces
    2. Add family members
    3. Manage privacy and access

- [ ] **3.13: Implement MarriageLinksSection**
  - [ ] 2 cards:
    1. Auto-link families through verified marriages
    2. View family relationship maps

- [ ] **3.14: Implement LegacyPreservationSection**
  - [ ] 4 cards:
    1. Add biographies, old photos, videos
    2. Create memorial pages
    3. AI-generated "Family Book" summary
    4. Digital vault for artifacts

- [ ] **3.15: Implement SocialEventsSection**
  - [ ] 3 cards:
    1. Private family feed
    2. Family meetings and events
    3. Chat and video rooms

- [ ] **3.16: Style features page**
  - [ ] Sections with background colors (alternate light/dark)
  - [ ] Max-width 1200px, centered
  - [ ] Cards: grid layout, responsive

- [ ] **3.17: Add animations**
  - [ ] Card hover effects
  - [ ] Scroll reveals

- [ ] **3.18: Add CTA**
  - [ ] Bottom section: "See How Families Are Using FamTree"
  - [ ] Button → /families

- [ ] **3.19: Add SEO**
  - [ ] Title: "FamTree Features - Digital Family Tree & Heritage Platform"
  - [ ] Meta description
  - [ ] Open Graph tags

---

### How It Works Page

**File:** `resources/js/Pages/GuestPages/HowItWorks/Index.tsx`

- [ ] **3.20: Create How It Works structure**
  - [ ] PageHeader (title, subtitle)
  - [ ] 5 steps displayed vertically:
    1. Sign Up
    2. Build Your Family Base
    3. Link Families
    4. Preserve Legacy
    5. Invite Others
  - [ ] CTASection (Ready to start?)

- [ ] **3.21: Create StepCard component**
  - [ ] Props: stepNumber, title, description, image/illustration, isLeft (alternating layout)
  - [ ] Step number: large, gold (#D4A574), 2-3rem
  - [ ] Title: Playfair Display, 2rem
  - [ ] Description: Inter, 1rem
  - [ ] Image: right side (if isLeft = false) or left side (if isLeft = true)

- [ ] **3.22: Implement step cards**
  - [ ] Step 1: "Sign Up" — Choose family name and location
  - [ ] Step 2: "Build Your Family Base" — Add parents, siblings, kids
  - [ ] Step 3: "Link Families" — Add marriages, relatives from other trees
  - [ ] Step 4: "Preserve Legacy" — Upload stories, photos, videos
  - [ ] Step 5: "Invite Others" — Let relatives join and verify connections

- [ ] **3.23: Add timeline visualization**
  - [ ] Vertical line connecting steps
  - [ ] Circle for each step number
  - [ ] Alternating layout:
    - [ ] Step 1: image right, text left
    - [ ] Step 2: image left, text right
    - [ ] Step 3: image right, text left
    - [ ] Step 4: image left, text right
    - [ ] Step 5: image right, text left

- [ ] **3.24: Style How It Works**
  - [ ] Background: light, cream-colored
  - [ ] Container: max-width 1000px, centered
  - [ ] Vertical alignment: top-to-bottom scroll flow
  - [ ] Responsive: stack image and text on mobile

- [ ] **3.25: Add animations**
  - [ ] Scroll reveal: steps fade-in + slide-up as they enter viewport
  - [ ] Timeline fills in as user scrolls down (optional, more complex)
  - [ ] Image parallax (moves slower than text)

- [ ] **3.26: Add end CTA**
  - [ ] "Your family story becomes part of a living digital heritage — forever accessible."
  - [ ] Button: "Ready to Start?" → CTAModal

- [ ] **3.27: Add SEO**
  - [ ] Title: "How FamTree Works - 5 Simple Steps"
  - [ ] Meta description
  - [ ] Open Graph tags

---

## 👨‍👩‍👧 PHASE 4: FAMILY EXPLORER & PREVIEW (Week 3)

### Family Explorer Page

**File:** `resources/js/Pages/GuestPages/FamilyExplorer/Index.tsx`

- [ ] **4.1: Create Family Explorer structure**
  - [ ] PageHeader (title, description)
  - [ ] SearchBar + FilterPanel (sticky on top of grid)
  - [ ] ResultsCount (dynamic)
  - [ ] FamilyGrid (family cards in responsive grid)
  - [ ] Pagination or infinite scroll

- [ ] **4.2: Create SearchBar component**
  - [ ] Input field: "Search by family name or state…"
  - [ ] Placeholder text visible
  - [ ] Clear button (X) when input has text
  - [ ] Debounced search (300ms delay before querying)
  - [ ] Search icon on left

- [ ] **4.3: Create FilterPanel component**
  - [ ] State dropdown (All States, Lagos, Enugu, Kano, etc.)
  - [ ] Tribe dropdown (optional, All Tribes)
  - [ ] Sort dropdown:
    - [ ] Most Popular
    - [ ] Most Members
    - [ ] Recently Active
    - [ ] Alphabetical
  - [ ] Filter button (submit filters)
  - [ ] Clear filters button

- [ ] **4.4: Create FamilyCard component**
  - [ ] Props: family (id, name, state, lga, founder, memberCount, coverImage)
  - [ ] Layout:
    - [ ] Cover image (top)
    - [ ] Family name (bold, large)
    - [ ] State/LGA (secondary text)
    - [ ] Founded by [name] (small text)
    - [ ] Member count (badge)
    - [ ] "View Family →" link/button
  - [ ] Hover effect: card lifts, image slightly zooms

- [ ] **4.5: Implement FamilyGrid**
  - [ ] Responsive grid: 4 columns (desktop), 3 (tablet), 2 (mobile), 1 (small mobile)
  - [ ] Gap: 24px
  - [ ] Cards equal height
  - [ ] Lazy load images

- [ ] **4.6: Implement pagination**
  - [ ] Option A: Numbered pagination (1, 2, 3...)
    - [ ] Show 12 families per page
    - [ ] Prev/Next buttons
    - [ ] Current page highlighted
  - [ ] Option B: Infinite scroll
    - [ ] Load more as user scrolls near bottom
    - [ ] Loading spinner
    - [ ] "No more results" message

- [ ] **4.7: Add empty state**
  - [ ] When no results found:
    - [ ] Icon (search, family)
    - [ ] Message: "No families found. Try adjusting your search."
    - [ ] CTA: "Browse all families" or "Create your family"

- [ ] **4.8: Create backend integration**
  - [ ] FamilyRepository:
    - [ ] Method: search($name)
    - [ ] Method: filterByState($state)
    - [ ] Method: filterByTribe($tribe)
    - [ ] Method: sortBy($sortOption)
    - [ ] Method: paginate($page, $perPage)
  - [ ] FamilyExplorerService:
    - [ ] Method: searchAndFilter($params)
    - [ ] Orchestrates repository calls
  - [ ] FamilyExplorerController:
    - [ ] index() method
    - [ ] Receives search/filter params from frontend
    - [ ] Calls service
    - [ ] Returns paginated results via Inertia

- [ ] **4.9: Connect frontend to backend**
  - [ ] Form submit → POST /families/search (AJAX)
  - [ ] Receive results (families array + pagination data)
  - [ ] Update grid with results
  - [ ] Show loading state during request

- [ ] **4.10: Add CTA overlays**
  - [ ] Non-logged-in users see overlay: "Join FamTree to see more details"
  - [ ] But: Can still view limited family preview

- [ ] **4.11: Add SEO**
  - [ ] Title: "Explore Nigerian Families - FamTree Family Directory"
  - [ ] Meta description
  - [ ] Open Graph tags

---

### Family Preview Page

**File:** `resources/js/Pages/GuestPages/FamilyPreview/[slug].tsx`

- [ ] **4.12: Create Family Preview structure**
  - [ ] FamilyBanner (cover photo, family name, state)
  - [ ] OriginInfo (state, LGA, village, short story)
  - [ ] FamilyHeadCard (photo, name, role, bio)
  - [ ] MembersPreview (3-5 members with blur overlay)
  - [ ] FamilyStats (total members, founded year, member count growth)
  - [ ] CTAOverlay ("Sign up to see full tree")
  - [ ] ShareButton (share family profile)

- [ ] **4.13: Implement FamilyBanner**
  - [ ] Full-width banner image
  - [ ] Family name overlay (bottom-left, large, white text)
  - [ ] State/location badge (bottom-right)
  - [ ] Fallback: solid color if no image

- [ ] **4.14: Implement OriginInfo**
  - [ ] Two-column layout:
    - [ ] Left: Story/description
    - [ ] Right: Origin map or info cards (state, LGA, village)
  - [ ] Story text: Inter, 1rem, light reading
  - [ ] Map: Optional, can be deferred

- [ ] **4.15: Implement FamilyHeadCard**
  - [ ] Photo (rounded, 120x120px)
  - [ ] Name (Playfair Display, 1.5rem)
  - [ ] Role/Title ("Family Head", "Founder", etc.)
  - [ ] Bio (short, 2-3 sentences)
  - [ ] Contact button (optional, if available)

- [ ] **4.16: Implement MembersPreview**
  - [ ] Title: "Family Members (limited preview)"
  - [ ] Show 3-5 member cards:
    - [ ] Photo, name, relationship to head
  - [ ] Blur effect over cards (semi-transparent overlay)
  - [ ] CTA button overlay: "See all [X] members → Sign up"
  - [ ] If click on member, show signup modal

- [ ] **4.17: Implement FamilyStats**
  - [ ] Cards showing:
    - [ ] Total Members: 45
    - [ ] Founded: 1985
    - [ ] Growth: "12 new members this year"
  - [ ] Grid layout, simple styling

- [ ] **4.18: Implement CTAOverlay**
  - [ ] Semi-transparent dark overlay over sensitive content
  - [ ] Text: "Want to see more members or connect? Create your account."
  - [ ] Button: "Join FamTree" → CTAModal

- [ ] **4.19: Implement ShareButton**
  - [ ] Top-right corner
  - [ ] onClick: open share modal
  - [ ] Share options: Copy link, WhatsApp, Facebook, Email
  - [ ] Share modal displays: Family name + link

- [ ] **4.20: Create backend**
  - [ ] FamilyRepository:
    - [ ] Method: findBySlug($slug)
    - [ ] Method: getPreviewData($familyId) — limited data only
  - [ ] FamilyPreviewController:
    - [ ] show($slug) method
    - [ ] Query family by slug
    - [ ] Return limited data (public members only)
  - [ ] Route: GET /families/{slug}

- [ ] **4.21: Handle 404 cases**
  - [ ] If family not found:
    - [ ] Display 404 page
    - [ ] Link back to /families
  - [ ] If family is private:
    - [ ] Display message: "This family is private"
    - [ ] CTA to contact family

- [ ] **4.22: Add SEO**
  - [ ] Dynamic title: "{FamilyName} Family - FamTree"
  - [ ] Dynamic meta description
  - [ ] Open Graph tags (especially og:image for family banner)
  - [ ] Canonical URL

---

## 📝 PHASE 5: BLOG PAGES (Week 4)

### Blog Listing Page

**File:** `resources/js/Pages/GuestPages/Blog/Index.tsx`

- [ ] **5.1: Create Blog page structure**
  - [ ] PageHeader (title)
  - [ ] Featured post carousel (top)
  - [ ] SearchBar + CategoryFilter (sticky)
  - [ ] BlogGrid (12+ cards, paginated)
  - [ ] BlogSidebar (right, sticky on desktop)

- [ ] **5.2: Create BlogCard component**
  - [ ] Props: post (id, title, slug, excerpt, featuredImage, category, author, date, viewCount)
  - [ ] Layout:
    - [ ] Featured image (top, responsive)
    - [ ] Category badge (colored, top-left)
    - [ ] Title (Playfair Display, 1.5rem)
    - [ ] Excerpt (100 chars max)
    - [ ] Author + date (small, secondary)
    - [ ] "Read More" link
  - [ ] Hover: image zooms, card lifts

- [ ] **5.3: Implement blog grid**
  - [ ] 3 columns (desktop), 2 (tablet), 1 (mobile)
  - [ ] Gap: 24px
  - [ ] Cards equal height
  - [ ] Responsive image sizing

- [ ] **5.4: Implement featured posts carousel**
  - [ ] Show 1-2 featured posts at top
  - [ ] Larger card styling
  - [ ] Auto-rotate or manual nav
  - [ ] Categories: "Family Stories", "Tips", "Culture"

- [ ] **5.5: Create SearchBar**
  - [ ] Input: "Search articles…"
  - [ ] Debounced search (300ms)
  - [ ] Search client-side (filter loaded posts) or backend

- [ ] **5.6: Create CategoryFilter**
  - [ ] Tabs or buttons for categories:
    - [ ] All
    - [ ] Family Stories
    - [ ] Tips
    - [ ] Culture
    - [ ] Heritage Preservation
  - [ ] Active tab highlighted
  - [ ] onClick: filter posts by category

- [ ] **5.7: Implement pagination**
  - [ ] 12 posts per page
  - [ ] Numbered pagination (like Family Explorer)
  - [ ] Prev/Next buttons

- [ ] **5.8: Create BlogSidebar**
  - [ ] Recent Posts (5 links)
  - [ ] Popular Posts (5 links, by view count)
  - [ ] Categories (list with count)
  - [ ] Newsletter Signup Form:
    - [ ] Email input
    - [ ] Submit button
    - [ ] "Get weekly heritage insights"

- [ ] **5.9: Create backend**
  - [ ] BlogRepository:
    - [ ] Method: all()
    - [ ] Method: findBySlug($slug)
    - [ ] Method: filterByCategory($category)
    - [ ] Method: search($query)
    - [ ] Method: paginate($page, $perPage)
    - [ ] Method: getRecent($limit)
    - [ ] Method: getPopular($limit)
    - [ ] Method: getCategories()
  - [ ] BlogService:
    - [ ] Method: getAllPosts($page, $category, $search)
    - [ ] Orchestrates repository calls
  - [ ] BlogController:
    - [ ] index() method
    - [ ] Receives search/filter params
    - [ ] Returns posts + pagination data

- [ ] **5.10: Add sample blog posts**
  - [ ] Create at least 10 blog posts in database (seed data)
  - [ ] Titles from PROJECT_STARTUP.md:
    - [ ] "The Adeyemi Family of Oyo — 5 Generations of Legacy"
    - [ ] "How to Preserve Family Photos Digitally"
    - [ ] "The Meaning of Family Names in Nigeria"
    - [ ] ... (create more)

- [ ] **5.11: Add SEO**
  - [ ] Title: "FamTree Blog - Family Heritage Stories & Tips"
  - [ ] Meta description
  - [ ] Open Graph tags

---

### Blog Detail Page

**File:** `resources/js/Pages/GuestPages/BlogDetail/[slug].tsx`

- [ ] **5.12: Create Blog Detail structure**
  - [ ] Article header (title, featured image, meta: author, date, reading time)
  - [ ] Article content (rich HTML)
  - [ ] Table of contents (if article long)
  - [ ] Social share buttons (top + bottom)
  - [ ] AuthorCard (author bio, social links)
  - [ ] RelatedPosts (3-4 carousel)
  - [ ] NewsletterSignup (CTA)
  - [ ] CommentsSection (optional, Disqus or custom)

- [ ] **5.13: Implement article header**
  - [ ] Full-width featured image
  - [ ] Title overlay (bottom, white text)
  - [ ] Meta info:
    - [ ] Author + avatar
    - [ ] Publish date
    - [ ] Reading time estimate
    - [ ] Category badge
  - [ ] Breadcrumb: Blog > Category > Article

- [ ] **5.14: Implement article content**
  - [ ] Render rich HTML from backend (dangerouslySetInnerHTML or safe alternative)
  - [ ] Styling for headings, paragraphs, lists, blockquotes
  - [ ] Code syntax highlighting (if applicable)
  - [ ] Image responsive sizing
  - [ ] Table styling (if articles have tables)
  - [ ] Max-width: 800px, centered

- [ ] **5.15: Add table of contents (optional)**
  - [ ] Auto-generate from H2/H3 headings
  - [ ] Sticky, left sidebar (desktop only)
  - [ ] Clicking jumps to section
  - [ ] Active section highlighted

- [ ] **5.16: Implement social share buttons**
  - [ ] Top-left and bottom-right
  - [ ] Share options:
    - [ ] Copy link (with toast notification)
    - [ ] WhatsApp
    - [ ] Facebook
    - [ ] Twitter/X
  - [ ] Use share URLs: `https://twitter.com/intent/tweet?url=...&text=...`

- [ ] **5.17: Implement AuthorCard**
  - [ ] Author photo (rounded, 80x80px)
  - [ ] Author name (bold)
  - [ ] Author bio (2-3 sentences)
  - [ ] Social links (Twitter, LinkedIn, Website)
  - [ ] "Follow" or "See more articles by [author]" link

- [ ] **5.18: Implement RelatedPosts**
  - [ ] 3-4 related articles (by category or tags)
  - [ ] Card grid or carousel
  - [ ] Link to articles

- [ ] **5.19: Implement NewsletterSignup**
  - [ ] Bottom section
  - [ ] Email input
  - [ ] Submit button
  - [ ] "Subscribe for weekly heritage stories"
  - [ ] Success message after submit

- [ ] **5.20: Add CommentsSection (optional)**
  - [ ] Can use Disqus (embed)
  - [ ] Or build custom comments (requires more backend work)
  - [ ] Defer if time-constrained

- [ ] **5.21: Create backend**
  - [ ] BlogRepository:
    - [ ] Method: findBySlug($slug)
    - [ ] Method: getRelated($categoryId, $limit)
    - [ ] Update view count
  - [ ] BlogController:
    - [ ] show($slug) method
    - [ ] Query blog post
    - [ ] Increment view count
    - [ ] Fetch related posts
    - [ ] Return to Inertia

- [ ] **5.22: Add SEO (crucial for blog)**
  - [ ] Dynamic title: "{PostTitle} - FamTree Blog"
  - [ ] Dynamic meta description: (excerpt)
  - [ ] Open Graph tags:
    - [ ] og:title
    - [ ] og:description
    - [ ] og:image (featured image)
    - [ ] og:url
  - [ ] Schema.org Article markup:
    ```json
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "...",
      "image": "...",
      "datePublished": "...",
      "author": {...},
      "description": "..."
    }
    ```

---

## 💌 PHASE 6: CONTACT PAGE (Week 4)

### Contact Page

**File:** `resources/js/Pages/GuestPages/Contact/Index.tsx`

- [ ] **6.1: Create Contact page structure**
  - [ ] PageHeader (title, description)
  - [ ] TwoColumn layout:
    - [ ] Left: ContactForm
    - [ ] Right: ContactInfo + EmbeddedMap
  - [ ] Social links (top or bottom)

- [ ] **6.2: Create ContactForm component**
  - [ ] Fields:
    - [ ] Name (text input, required)
    - [ ] Email (email input, required, validated)
    - [ ] Subject (text input, required)
    - [ ] Message (textarea, required, min 10 chars)
  - [ ] Submit button: "Send Message"
  - [ ] Loading state (disable button, show spinner)
  - [ ] Success message: "Thank you! We'll get back to you soon."
  - [ ] Error message (if submission fails)

- [ ] **6.3: Implement form validation**
  - [ ] Client-side:
    - [ ] Use react-hook-form + zod
    - [ ] Name: not empty
    - [ ] Email: valid email format
    - [ ] Subject: not empty
    - [ ] Message: min 10 characters
    - [ ] Show error messages below fields
  - [ ] Server-side: validate again in controller

- [ ] **6.4: Create ContactInfo component**
  - [ ] Address (if applicable; can be generic for now)
  - [ ] Email: contact@famtree.com
  - [ ] Phone: (optional, can add later)
  - [ ] Office hours: (optional)
  - [ ] Social links:
    - [ ] Twitter/X
    - [ ] Facebook
    - [ ] Instagram
    - [ ] LinkedIn

- [ ] **6.5: Add EmbeddedMap (optional)**
  - [ ] Can defer this, but nice to have
  - [ ] Use Google Maps embed or Mapbox
  - [ ] Show FamTree office location (if exists)
  - [ ] Or show Nigeria map with heritage theme

- [ ] **6.6: Style Contact page**
  - [ ] Two-column responsive (stack on mobile)
  - [ ] Form: centered, max-width 500px
  - [ ] Card styling for both columns
  - [ ] Spacing and padding

- [ ] **6.7: Create backend**
  - [ ] ContactService:
    - [ ] Method: submitForm($data)
    - [ ] Validate data
    - [ ] Send email to support team
    - [ ] Save to database
  - [ ] ContactRepository:
    - [ ] Method: create($data)
    - [ ] Store contact submission in DB
  - [ ] ContactController:
    - [ ] index() — return contact page
    - [ ] store() — handle form submission
  - [ ] Route: GET /contact, POST /contact

- [ ] **6.8: Setup email notification**
  - [ ] Create Mailable: `ContactFormSubmitted`
  - [ ] Email template (HTML)
  - [ ] Send to support email
  - [ ] Include form data (name, email, message)
  - [ ] Include "reply to" address (user's email)

- [ ] **6.9: Optional: Auto-reply to user**
  - [ ] Send confirmation email to user
  - [ ] "Thanks for contacting us! We'll be in touch."
  - [ ] Can defer if not priority

- [ ] **6.10: Add CSRF protection**
  - [ ] Form includes CSRF token
  - [ ] Middleware validates token
  - [ ] Toast error if token invalid

- [ ] **6.11: Add rate limiting (optional)**
  - [ ] Prevent spam (max 5 submissions per IP per hour)
  - [ ] Return 429 error if limit exceeded
  - [ ] Show user-friendly message

- [ ] **6.12: Add SEO**
  - [ ] Title: "Contact FamTree - Get In Touch"
  - [ ] Meta description
  - [ ] Open Graph tags

---

## ✨ PHASE 7: POLISH & OPTIMIZATION (Week 5)

### Performance & Image Optimization

- [ ] **7.1: Image optimization**
  - [ ] Generate WebP versions of all images
  - [ ] Create responsive image sets (srcset)
  - [ ] Lazy load off-screen images
  - [ ] Use Next.js Image or similar (Inertia doesn't have built-in, use native)
  - [ ] Optimize featured images for blog
  - [ ] Optimize hero background

- [ ] **7.2: Code splitting**
  - [ ] Lazy load page components with React.lazy
  - [ ] Lazy load heavy components (carousels, maps)
  - [ ] Verify bundle size: `npm run build`
  - [ ] Aim for: main bundle < 200KB, page bundles < 100KB each

- [ ] **7.3: CSS optimization**
  - [ ] Remove unused Bootstrap classes
  - [ ] Minify CSS
  - [ ] Extract critical CSS for above-fold content
  - [ ] Defer non-critical CSS

- [ ] **7.4: JS optimization**
  - [ ] Minify (done automatically by Vite)
  - [ ] Tree-shake unused code
  - [ ] Check for duplicate dependencies
  - [ ] Lazy load animations (Lottie)

---

### SEO Optimization

- [ ] **7.5: Meta tags on all pages**
  - [ ] Verify each page has:
    - [ ] Title (50-60 chars)
    - [ ] Meta description (150-160 chars)
    - [ ] Canonical URL
    - [ ] Open Graph tags (title, desc, image, url)
    - [ ] Twitter card tags (optional)

- [ ] **7.6: Schema.org markup**
  - [ ] Organization schema (on home page):
    ```json
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "FamTree",
      "url": "https://famtree.com",
      "logo": "...",
      "description": "...",
      "sameAs": ["https://twitter.com/...", ...]
    }
    ```
  - [ ] Article schema (on blog posts)
  - [ ] LocalBusiness schema (on contact page)
  - [ ] BreadcrumbList schema (on multi-level pages)

- [ ] **7.7: Sitemap generation**
  - [ ] Create `public/sitemap.xml`
  - [ ] List all pages: /, /about, /features, /how-it-works, /blog, /contact, /families, /families/{slug}, /blog/{slug}
  - [ ] Include `<lastmod>` dates
  - [ ] Submit to Google Search Console

- [ ] **7.8: Robots.txt**
  - [ ] Create `public/robots.txt`
  - [ ] Allow crawlers: `User-agent: * Allow: /`
  - [ ] Disallow: `/admin`, `/api` (if applicable)
  - [ ] Link to sitemap: `Sitemap: https://famtree.com/sitemap.xml`

- [ ] **7.9: Open Graph images**
  - [ ] Create OG image for each page
  - [ ] Size: 1200x630px
  - [ ] Include brand colors, headline
  - [ ] For blog: use featured image or create custom

---

### Accessibility Testing

- [ ] **7.10: WCAG 2.1 AA compliance**
  - [ ] Color contrast: all text >= 4.5:1 ratio
    - [ ] Use WebAIM contrast checker
    - [ ] Test: dark text on light, light on dark
  - [ ] Font sizes: minimum 16px base
  - [ ] Line heights: minimum 1.5

- [ ] **7.11: Keyboard navigation**
  - [ ] Tab through all interactive elements
  - [ ] Order should be logical (left-to-right, top-to-bottom)
  - [ ] Skip links to main content (optional but good)
  - [ ] Modal traps focus (Tab cycles within modal)
  - [ ] Escape key closes modals

- [ ] **7.12: Screen reader testing**
  - [ ] Use NVDA (free, Windows) or JAWS (paid, Windows) or VoiceOver (Mac)
  - [ ] Test each page:
    - [ ] Page title announced
    - [ ] Headings properly structured (H1, H2, H3)
    - [ ] Form labels associated with inputs
    - [ ] Images have alt text
    - [ ] Links have descriptive text (not "click here")
    - [ ] Buttons identified as buttons
    - [ ] Error messages announced
  - [ ] Add ARIA labels where needed:
    - [ ] `aria-label` for icon-only buttons
    - [ ] `aria-describedby` for form errors
    - [ ] `aria-live="polite"` for success messages

- [ ] **7.13: Axe DevTools audit**
  - [ ] Install Axe DevTools browser extension
  - [ ] Run on each page
  - [ ] Fix critical issues (reds)
  - [ ] Address warnings (yellows)
  - [ ] Document why any violations can't be fixed

- [ ] **7.14: ARIA and semantic HTML**
  - [ ] Use semantic HTML5 elements:
    - [ ] `<header>`, `<nav>`, `<main>`, `<footer>`
    - [ ] `<section>`, `<article>` for content areas
    - [ ] `<button>` for buttons (not `<div onclick>`)
    - [ ] `<a>` for links
  - [ ] Navigation: `<nav aria-label="Main navigation">`
  - [ ] Form: proper `<label>` associations
  - [ ] Buttons: `aria-pressed`, `aria-expanded` for state

---

### Mobile & Cross-Browser Testing

- [ ] **7.15: Mobile device testing**
  - [ ] iPhone 12, iPhone 14, iPhone SE (various sizes)
  - [ ] Galaxy S21, Galaxy A12
  - [ ] Tablet: iPad (9.7"), iPad Pro (12.9")
  - [ ] Test using Chrome DevTools device emulation first
  - [ ] Then test on real devices
  - [ ] Check:
    - [ ] Viewport meta tag correct (width=device-width)
    - [ ] Touch targets 48px minimum
    - [ ] No horizontal scroll
    - [ ] Forms mobile-friendly (large inputs, labels above)
    - [ ] Hamburger menu works
    - [ ] Modals responsive

- [ ] **7.16: Responsive design testing**
  - [ ] 320px (iPhone SE)
  - [ ] 375px (iPhone)
  - [ ] 640px (tablet portrait)
  - [ ] 768px (tablet landscape)
  - [ ] 1024px (desktop)
  - [ ] 1440px (large desktop)
  - [ ] Use Chrome DevTools viewport resizer
  - [ ] No content cutoff
  - [ ] No text too small to read
  - [ ] Spacing/padding appropriate

- [ ] **7.17: Cross-browser testing**
  - [ ] Chrome latest (Blink engine)
  - [ ] Firefox latest (Gecko)
  - [ ] Safari latest (WebKit, macOS + iOS)
  - [ ] Edge latest (Chromium)
  - [ ] Use BrowserStack or local testing
  - [ ] Check:
    - [ ] Colors render correctly
    - [ ] Fonts load (no FOUT)
    - [ ] Animations smooth
    - [ ] Forms work
    - [ ] Modals display correctly
    - [ ] No console errors

---

### Security & Form Validation

- [ ] **7.18: CSRF protection**
  - [ ] All POST/PUT/DELETE forms include CSRF token
  - [ ] Token sent via `<input name="_token" value="...">` or header
  - [ ] Middleware validates: HandleInertiaRequests middleware
  - [ ] Test: submit form without token → should fail (419 error)

- [ ] **7.19: XSS prevention**
  - [ ] All user input escaped when displayed
  - [ ] React escapes by default (good)
  - [ ] For HTML content (blog), sanitize:
    - [ ] Use DOMPurify or similar
    - [ ] Whitelist safe HTML tags (p, h1-h6, a, ul, li, etc.)
    - [ ] Strip script tags, event handlers
  - [ ] Test: add `<script>alert('xss')</script>` to form → should not execute

- [ ] **7.20: Server-side validation**
  - [ ] Contact form: validate all fields again on server
  - [ ] Email validation (Laravel's 'email' rule)
  - [ ] Length validation (max/min)
  - [ ] Return 422 (Unprocessable Entity) for validation errors
  - [ ] Show errors to user

- [ ] **7.21: Rate limiting**
  - [ ] Contact form: limit to 5 submissions per IP per hour
  - [ ] Use Laravel's `Illuminate\Routing\Middleware\ThrottleRequests`
  - [ ] Return 429 (Too Many Requests) when exceeded
  - [ ] Show user message: "You're sending too many requests. Please try again later."

- [ ] **7.22: Sensitive data**
  - [ ] No API keys in frontend code
  - [ ] No passwords in logs
  - [ ] Contact form: encrypt email in database (optional)
  - [ ] No personal info in error messages

---

### Testing & QA

- [ ] **7.23: Unit tests (frontend)**
  - [ ] Test components render without errors
  - [ ] Test form validation logic
  - [ ] Test navigation/routing
  - [ ] Example:
    ```javascript
    describe('CTAModal', () => {
      test('renders login tab by default', () => {
        render(<CTAModal isOpen={true} />);
        expect(screen.getByText('Login')).toBeInTheDocument();
      });
    });
    ```

- [ ] **7.24: Unit tests (backend)**
  - [ ] Test repositories (find, all, create, etc.)
  - [ ] Test services (business logic)
  - [ ] Test validation
  - [ ] Example:
    ```php
    public function test_can_create_family() {
      $family = FamilyRepository::create(['name' => 'Okafor', ...]);
      $this->assertDatabaseHas('families', ['name' => 'Okafor']);
    }
    ```

- [ ] **7.25: E2E tests (critical flows)**
  - [ ] Test user lands on home → scrolls through → clicks signup → modal opens
  - [ ] Test search families → filter by state → click family → see preview
  - [ ] Test search blog → read article → share → subscribe newsletter
  - [ ] Test contact form → submit → success message
  - [ ] Use Playwright or Cypress
  - [ ] Run before deployment

- [ ] **7.26: Manual QA checklist**
  - [ ] All links work (no 404s)
  - [ ] All forms submit successfully
  - [ ] All modals open/close
  - [ ] All animations smooth
  - [ ] All images load
  - [ ] All text readable
  - [ ] Color contrast sufficient
  - [ ] Responsive design works
  - [ ] No console errors
  - [ ] No console warnings (major ones)

---

### Deployment Preparation

- [ ] **7.27: Environment setup**
  - [ ] .env file configured:
    - [ ] APP_ENV=production
    - [ ] APP_DEBUG=false
    - [ ] DB_HOST, DB_DATABASE, DB_PASSWORD set
    - [ ] MAIL credentials set (Mailgun, SendGrid, etc.)
  - [ ] APP_KEY generated: `php artisan key:generate`
  - [ ] No secrets in code

- [ ] **7.28: Production build**
  - [ ] `npm run build` completes without errors
  - [ ] `public/build/` directory created
  - [ ] `public/build/manifest.json` exists
  - [ ] Bundle size acceptable
  - [ ] Sourcemaps (optional, can disable for security)

- [ ] **7.29: Database setup**
  - [ ] Create database on production server
  - [ ] Run migrations: `php artisan migrate --force`
  - [ ] Seed initial data: `php artisan db:seed`
  - [ ] Verify tables created

- [ ] **7.30: Cache & optimization**
  - [ ] Clear old caches: `php artisan cache:clear`
  - [ ] Run config cache: `php artisan config:cache`
  - [ ] Run route cache: `php artisan route:cache`
  - [ ] Run view cache (optional): `php artisan view:cache`

- [ ] **7.31: SSL certificate**
  - [ ] HTTPS enabled
  - [ ] SSL certificate valid (Let's Encrypt)
  - [ ] HTTP redirects to HTTPS
  - [ ] Verify with https://www.sslshopper.com/ssl-checker.html

- [ ] **7.32: Monitoring & analytics**
  - [ ] Google Analytics 4 setup
  - [ ] Goal tracking (signup, contact form, etc.)
  - [ ] Sentry error tracking (optional)
  - [ ] Uptime monitoring (Pingdom, UptimeRobot)
  - [ ] Performance monitoring (Google PageSpeed Insights)

---

## 📊 SUMMARY

### Total Tasks: ~250+ individual checkboxes

### Phases:
- **Phase 1 (Week 1):** Foundation → 32 tasks
- **Phase 2 (Week 2):** Home page → 32 tasks
- **Phase 3 (Week 2-3):** About, Features, HowItWorks → 44 tasks
- **Phase 4 (Week 3):** Family Explorer & Preview → 22 tasks
- **Phase 5 (Week 4):** Blog pages → 22 tasks
- **Phase 6 (Week 4):** Contact page → 12 tasks
- **Phase 7 (Week 5):** Polish & optimization → ~85+ tasks

### Estimated Timeline
- **8-10 weeks** for single developer
- **5-6 weeks** for 2 developers
- **3-4 weeks** for 3+ developers (with parallelization)

### Key Deliverables
1. ✅ 9 fully functional pages
2. ✅ 4 shared components (Navigation, Footer, CTAModal, etc.)
3. ✅ Responsive design (mobile, tablet, desktop)
4. ✅ SEO optimized
5. ✅ Accessible (WCAG 2.1 AA)
6. ✅ Performance optimized (Lighthouse 90+)
7. ✅ Security hardened
8. ✅ Tested (unit, integration, E2E)
9. ✅ Production-ready

---

**Ready to start? Begin with Phase 1, Week 1, Task 1.1!**
