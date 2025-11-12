# 🎯 FAMTREE GUEST PAGES IMPLEMENTATION PLAN

**Document Purpose:** Detailed technical and design approach for building all guest-facing (non-logged-in) UI pages for FamTree.

**Author:** Claude Code
**Project:** FamTree / FamTree
**Date:** November 2025

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Page Inventory & Structure](#page-inventory--structure)
3. [Design System & Standards](#design-system--standards)
4. [Component Architecture](#component-architecture)
5. [Implementation Breakdown](#implementation-breakdown)
6. [Development Sequence](#development-sequence)
7. [Dependencies & Libraries](#dependencies--libraries)
8. [Testing Strategy](#testing-strategy)

---

## 🎯 OVERVIEW

### Project Scope
Building 9 main guest pages (+ 4 shared components) that constitute the entire pre-login user journey for FamTree.

### Key Objectives
- ✅ **Conversion-focused**: Every page has clear CTAs guiding users to signup/login
- ✅ **Emotional appeal**: Tell the FamTree story through design and content
- ✅ **Mobile-responsive**: All pages fully responsive (mobile-first design)
- ✅ **Performance**: Fast load times, optimized images, lazy loading
- ✅ **SEO-friendly**: Proper semantic HTML, meta tags, Open Graph tags
- ✅ **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support
- ✅ **Consistency**: Unified design language across all pages

### Target Audience
- Nigerian families (primary) across all socioeconomic levels
- English-speaking users (phase 1; multi-language later)
- Desktop and mobile users equally

---

## 📄 PAGE INVENTORY & STRUCTURE

### Pages to Build

| # | Page Name | Route | Purpose | Complexity | Priority |
|---|-----------|-------|---------|-----------|----------|
| 1 | Home/Landing | `/` | Hero intro + mission overview + CTAs | High | P0 |
| 2 | About | `/about` | Team, mission, vision story | Medium | P1 |
| 3 | Features | `/features` | Interactive feature showcase | High | P1 |
| 4 | How It Works | `/how-it-works` | Step-by-step onboarding flow | Medium | P1 |
| 5 | Blog/Heritage Stories | `/blog` | Content hub + SEO | High | P2 |
| 6 | Blog Post Detail | `/blog/:slug` | Individual article view | Medium | P2 |
| 7 | Contact | `/contact` | Contact form + support info | Low | P2 |
| 8 | Public Family Explorer | `/families` | Search/filter families | High | P1 |
| 9 | Family Preview/Profile | `/families/:slug` | Sample family public profile | High | P1 |

### Shared Components (non-page)

| Component | Usage | Complexity |
|-----------|-------|-----------|
| Navigation Bar | All pages | Medium |
| Footer | All pages | Low |
| Hero Section | Home, Features | Medium |
| CTA Modal (Login/Register) | Triggerable from any page | High |
| Feature Card | Features page, Home | Low |
| Family Card | Family Explorer, Home | Medium |
| Section Divider | All pages | Low |

---

## 🎨 DESIGN SYSTEM & STANDARDS

### Color Palette

```
Primary Colors:
  - Gold/Amber: #D4A574 (warm, heritage feel)
  - Deep Blue: #1B3A52 (trust, stability)
  - Soft Brown: #8B6F47 (earth, roots)

Secondary Colors:
  - Cream: #FFF8F0 (background, light sections)
  - Sage Green: #7BA77F (growth, family)
  - Warm Gray: #A8A4A4 (text, secondary)

Text Colors:
  - Primary Text: #2C2C2C (near black, readability)
  - Secondary Text: #666666 (body copy)
  - Accent Text: #D4A574 (links, highlights)
```

### Typography

```
Headings:
  - Font: Playfair Display (serif, elegant)
  - Sizes: H1 (3rem), H2 (2.5rem), H3 (2rem), H4 (1.5rem)
  - Weight: 700 (bold)

Body Text:
  - Font: Inter (modern sans-serif)
  - Size: 1rem (16px) base
  - Weight: 400 (regular), 500 (medium), 600 (semibold)
  - Line Height: 1.6

Accents:
  - Font: Poppins (modern, friendly)
  - Usage: CTAs, labels, small UI elements
```

### Spacing System

```
Baseline: 8px unit system
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px
  - 2xl: 48px
  - 3xl: 64px
```

### Component Styles

```
Buttons:
  - Primary: Gold background, white text, 12px padding, 8px border-radius
  - Secondary: White background, blue border, blue text
  - Hover: All buttons lighten background slightly, shadow appears
  - Disabled: 50% opacity

Cards:
  - Background: White or Cream
  - Shadow: 0 4px 6px rgba(0,0,0,0.1) (soft)
  - Border-radius: 12px
  - Padding: 24px

Inputs:
  - Border: 2px solid #E0E0E0
  - Focus: Border color changes to gold
  - Placeholder: Light gray
  - Height: 48px (touch-friendly)

Links:
  - Color: Gold accent color
  - Underline: None (show on hover)
  - Hover: Underline + slight color change
```

### Animation Standards

```
Transitions:
  - Default: 300ms ease-in-out
  - Hover/Focus: 200ms ease-out
  - Page load: 400ms ease-in-out

Effects:
  - Fade-in: opacity 0 → 1
  - Slide-up: translateY(20px) → translateY(0)
  - Parallax: Subtle (20-30px offset on scroll)
  - Pulse/Bounce: Only on CTAs (not distracting)
```

### Responsive Breakpoints

```
Mobile: 320px - 639px
Tablet: 640px - 1023px
Desktop: 1024px - 1440px
Wide: 1441px+

Grid:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns (for cards)
```

---

## 🏗️ COMPONENT ARCHITECTURE

### Folder Structure (Frontend)

```
resources/js/Pages/GuestPages/
├── Home/
│   ├── Index.tsx (main page)
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── MissionSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── FamilyShowcaseSection.tsx
│   │   ├── FeaturesGridSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   └── CTAFooterSection.tsx
│   └── styles/ (if needed)
├── About/
│   ├── Index.tsx
│   └── sections/
│       ├── MissionSection.tsx
│       ├── StorySection.tsx
│       ├── VisionSection.tsx
│       └── TeamSection.tsx
├── Features/
│   ├── Index.tsx
│   └── sections/
│       ├── FamilyCreationSection.tsx
│       ├── MarriageLinksSection.tsx
│       ├── LegacyPreservationSection.tsx
│       └── SocialEventsSection.tsx
├── HowItWorks/
│   ├── Index.tsx
│   └── components/
│       └── StepCard.tsx
├── Blog/
│   ├── Index.tsx
│   └── components/
│       ├── BlogCard.tsx
│       └── BlogSidebar.tsx
├── BlogDetail/
│   └── [slug].tsx
├── Contact/
│   ├── Index.tsx
│   └── components/
│       └── ContactForm.tsx
├── FamilyExplorer/
│   ├── Index.tsx
│   └── components/
│       ├── FamilyCard.tsx
│       ├── SearchBar.tsx
│       └── FilterPanel.tsx
├── FamilyPreview/
│   └── [slug].tsx
└── shared/
    ├── NavigationBar.tsx
    ├── Footer.tsx
    └── CTAModal.tsx
```

### Backend Structure (For Guest Pages)

```
app/
├── Http/
│   └── Controllers/
│       └── GuestControllers/
│           ├── HomeController.php
│           ├── AboutController.php
│           ├── FeaturesController.php
│           ├── HowItWorksController.php
│           ├── BlogController.php
│           ├── ContactController.php
│           ├── FamilyExplorerController.php
│           └── FamilyPreviewController.php
├── Actions/
│   └── GuestServices/
│       ├── BlogService.php
│       ├── FamilyExplorerService.php
│       ├── ContactService.php
│       └── SEOService.php
├── Repositories/
│   └── GuestRepositories/
│       ├── BlogRepository.php
│       └── FamilyRepository.php
└── Models/
    ├── Family.php
    ├── BlogPost.php
    └── Contact.php
```

---

## 🔧 IMPLEMENTATION BREAKDOWN

### Page 1: HOME PAGE (Landing) — `GuestPages/Home/Index.tsx`

**Components:**
```
Home/Index
├── HeroSection (animated background, headline, CTAs)
├── MissionSection (text + visual)
├── HowItWorksSection (3-step cards with icons)
├── FamilyShowcaseSection (sample family carousel/grid)
├── FeaturesGridSection (6 feature cards: 3x2 grid)
├── TestimonialsSection (3-5 testimonial cards)
└── CTAFooterSection (big banner + CTA)
```

**Features:**
- Animated hero background (interconnecting nodes via SVG or Lottie animation)
- Parallax scroll effects on sections
- Hover animations on feature cards
- Carousel for family showcase (Swiper or react-slick)
- Testimonial rotation (fade-in/out)

**Data Needed (Backend):**
- Sample testimonials (hardcoded initially, later from DB)
- Feature icons/descriptions
- Sample families for showcase

**Hero Background Animation:**
- Option A: SVG network animation (D3.js or custom)
- Option B: Lottie JSON animation (lightweight)
- Option C: CSS-only (subtle gradient + floating particles)

**CTA Integration:**
- "Create Your Family Space" → Opens CTAModal (Login/Register)
- "Explore Families" → Routes to /families

---

### Page 2: ABOUT PAGE — `GuestPages/About/Index.tsx`

**Sections:**
```
About/Index
├── PageHeader (page title, breadcrumb)
├── MissionSection (Our Mission text + icon)
├── StorySection (Why It Matters narrative)
├── VisionSection (Vision 2030 + timeline?)
├── TeamSection (Team bios with photos)
└── CTASection (Join the Movement button)
```

**Features:**
- Team member cards with photo, name, role, and mini bio
- Timeline visualization for Vision 2030
- Emotional storytelling with carefully chosen imagery

**Data Needed:**
- Team member details (name, role, bio, photo)
- Company mission/vision statements

**Design Notes:**
- Use typography to create visual hierarchy
- Incorporate subtle heritage patterns in background
- Real team photos (inclusive, diverse)

---

### Page 3: FEATURES PAGE — `GuestPages/Features/Index.tsx`

**Sections:**
```
Features/Index
├── PageHeader
├── FamilyCreationSection
│   └── FeatureCards (Create spaces, Add members, Privacy)
├── MarriageLinksSection
│   └── FeatureCards (Link families, Relationship maps)
├── LegacyPreservationSection
│   └── FeatureCards (Bios, Photos, Memorial pages, AI book)
├── SocialEventsSection
│   └── FeatureCards (Family feed, Events, Chat/video)
└── CTASection
```

**Features:**
- Accordion or tab-based feature browsing
- Interactive mini-demo embedded (e.g., short GIF/video showing a feature in action)
- Icons or illustrations for each feature
- Expandable cards (click to reveal more detail)

**Visual Approach:**
- Alt/Side Image: Each feature group has an illustration or screenshot
- Color-coded feature cards by category

**CTA:** "See How Families Are Using FamTree" → Opens modal or routes to /families

---

### Page 4: HOW IT WORKS PAGE — `GuestPages/HowItWorks/Index.tsx`

**Sections:**
```
HowItWorks/Index
├── PageHeader
├── StepCard (Step 1: Sign Up)
├── StepCard (Step 2: Build Your Family Base)
├── StepCard (Step 3: Link Families)
├── StepCard (Step 4: Preserve Legacy)
├── StepCard (Step 5: Invite Others)
└── CTASection
```

**Design:**
- Vertical timeline with connecting lines between steps
- Alternating layout (image left, text right → text left, image right)
- Each step has a number, headline, description, and illustration
- Scroll reveals with parallax effects

**Visual Elements:**
- Step numbers: Large, gold-colored
- Icons: Consistent 64x64px icons for each step
- Progress indicator: Visual indication of which step user is on (if interactive)

**Interactivity:**
- Hover over step → card lifts (shadow effect)
- Click step → expands to show more detail (optional)

**CTA:** "Ready to Start?" button at the end

---

### Page 5: BLOG/HERITAGE STORIES — `GuestPages/Blog/Index.tsx`

**Sections:**
```
Blog/Index
├── PageHeader (Blog title + featured post)
├── SearchBar + FilterTabs (Categories, Trending)
├── BlogGrid (12+ cards visible, pagination)
├── BlogCard
│   ├── Featured image
│   ├── Category badge
│   ├── Title
│   ├── Excerpt (100 chars)
│   ├── Author + Date
│   └── "Read More" link
└── Sidebar (right, sticky on desktop)
    ├── About Blog
    ├── Recent Posts
    ├── Popular Posts
    ├── Categories
    └── Newsletter Signup
```

**Features:**
- Search functionality (client-side initially, backend later)
- Category filters (Family Stories, Tips, Culture, etc.)
- Pagination (12 posts per page)
- Featured post carousel at top
- Newsletter signup form
- Social share buttons on blog cards

**Data Needed:**
- Blog posts (title, slug, excerpt, content, featured_image, category, author, date)
- Categories list

**SEO:**
- Meta tags for blog list page
- Meta tags for individual posts
- Open Graph tags for social sharing
- Structured data (ArticleSchema, BreadcrumbSchema)

---

### Page 6: BLOG POST DETAIL — `GuestPages/BlogDetail/[slug].tsx`

**Sections:**
```
BlogDetail/[slug]
├── PageHeader (Title, featured image, meta info)
├── ArticleContent (main blog text with rich formatting)
├── AuthorCard (author bio + links)
├── RelatedPosts (3-4 related articles)
├── NewsletterSignup (bottom CTA)
└── CommentSection (optional: Disqus or custom)
```

**Features:**
- Syntax highlighting for code blocks (if applicable)
- Table of contents (if long article)
- Social share buttons (top + bottom)
- Copy-to-clipboard for code
- Reading time estimate
- Related posts carousel

**Content:**
- Rich text support (bold, italic, headings, lists, quotes)
- Image galleries / embedded media
- Internal link suggestions

**SEO:**
- Canonical URL
- Meta description
- Open Graph tags (especially image)
- Schema.org Article markup

---

### Page 7: CONTACT PAGE — `GuestPages/Contact/Index.tsx`

**Sections:**
```
Contact/Index
├── PageHeader
├── TwoColumn Layout
│   ├── Left: ContactForm
│   │   ├── Name field
│   │   ├── Email field
│   │   ├── Subject field
│   │   ├── Message textarea
│   │   └── Submit button
│   └── Right: ContactInfo
│       ├── Address
│       ├── Email
│       ├── Phone
│       ├── Office Hours
│       └── SocialLinks
└── EmbeddedMap (optional: Google Maps or Mapbox)
```

**Features:**
- Form validation (client-side + server-side)
- Success message on submission
- Accessibility: proper labels, focus management
- Auto-response email (backend)

**Backend Integration:**
- ContactService (handle form submission, validation)
- Email notification to support team
- Store submissions in database for follow-up

**Social Links:**
- Twitter/X
- Facebook
- Instagram
- LinkedIn (optional)

---

### Page 8: PUBLIC FAMILY EXPLORER — `GuestPages/FamilyExplorer/Index.tsx`

**Sections:**
```
FamilyExplorer/Index
├── PageHeader (title + description)
├── SearchBar + Filter Panel
│   ├── Search by name
│   ├── Filter by state/LGA
│   ├── Filter by tribe (optional)
│   ├── Sort by (popularity, members, recently active)
│   └── Filter button
├── ResultsCount
├── FamilyGrid
│   └── FamilyCard (repeating)
│       ├── Family name
│       ├── State/LGA
│       ├── Founded by [name]
│       ├── Member count
│       └── "View Family" CTA
└── Pagination (infinite scroll or numbered pages)
```

**Features:**
- Real-time search (debounced API calls)
- Multiple filter options
- Sorting options
- Responsive grid (1 col mobile → 4 cols desktop)
- Lazy loading for images
- CTA overlay for non-logged-in users

**Data Needed:**
- Public families list (with privacy controls)
- Family count, member count, state info

**Accessibility:**
- Keyboard navigation (Tab through results)
- Screen reader: proper ARIA labels
- Search field: accessible placeholder text

**Backend Implementation:**
- FamilyExplorerService (search, filter, sort)
- FamilyRepository (query families with permissions check)

**CTA Integration:**
- "View Family" → Routes to /families/:slug
- On preview page, CTA overlay says "Create account to see more"

---

### Page 9: FAMILY PREVIEW/PROFILE — `GuestPages/FamilyPreview/[slug].tsx`

**Sections:**
```
FamilyPreview/[slug]
├── FamilyBanner (cover photo + family name + state)
├── OriginInfo (state, LGA, village, story snippet)
├── FamilyHeadCard (photo, name, role, bio)
├── MembersPreview
│   └── Limited member cards (3-5 only, with blur/overlay)
├── CTAOverlay
│   └── "Want to see all members? Sign up now."
├── FamilyStats (total members, founded year, etc.)
└── RelatedFamilies (via marriage links, if applicable)
```

**Features:**
- Dynamic data based on family slug
- Partial information visibility (teaser effect)
- Fallback handling (family not found, privacy restrictions)
- Share family profile button (opens share modal with link)

**Privacy Model:**
- Public families can be partially viewed by guests
- Full tree visible only after login + approval
- Admin can control what's visible to public

**CTA Strategy:**
- "See Full Family Tree" → Sign up modal
- "View [X] More Members" → Sign up modal
- "Add Your Family" → Sign up modal

**Backend Logic:**
- FamilyRepository: Get public family data
- Filter members based on privacy settings
- Count total members but only display limited preview

---

## 📊 SHARED COMPONENTS

### 1. Navigation Bar — `shared/NavigationBar.tsx`

**Features:**
- Fixed top, transparent → solid on scroll
- Logo on left
- Menu items: Home, About, Features, How It Works, Blog, Contact, Families
- Right side: Login/Register buttons (or user menu if logged in)
- Mobile hamburger menu (collapse menu on smaller screens)
- Active route highlighting

**Responsive:**
- Desktop: Full horizontal menu
- Tablet: Compact with 2-line items
- Mobile: Hamburger icon → slide-out menu

**Accessibility:**
- ARIA navigation role
- Keyboard navigation (Tab, Enter)
- Focus indicators visible

---

### 2. Footer — `shared/Footer.tsx`

**Structure:**
```
Footer
├── Top Section
│   ├── Logo + tagline
│   ├── Quick Links Column
│   │   ├── Home, About, Features, Contact, Blog
│   ├── Resources Column
│   │   ├── FAQ, Privacy, Terms, Accessibility
│   ├── Social Links Column
│   │   ├── Twitter, Facebook, Instagram
│   └── CTA Button ("Create Your Family")
├── Bottom Section
│   ├── Copyright © FamTree 2025
│   └── Back-to-top button (on mobile)
```

**Features:**
- Sticky on page bottom
- Dark background (deep blue or dark gray)
- Good contrast for readability
- Newsletter signup form (optional, moved to modal)

---

### 3. CTA Modal (Login/Register) — `shared/CTAModal.tsx`

**Structure:**
```
CTAModal
├── Modal backdrop (clickable to close)
├── Modal body
│   ├── Modal header (close button, logo)
│   ├── Tabs (Login | Register)
│   ├── Tab 1: Login
│   │   ├── Email field
│   │   ├── Password field
│   │   ├── Forgot password link
│   │   ├── Login button
│   │   └── Footer: "New here? Register"
│   ├── Tab 2: Register
│   │   ├── Full Name field
│   │   ├── Email field
│   │   ├── Password field
│   │   ├── Confirm Password field
│   │   ├── Family name dropdown (optional)
│   │   ├── Register button
│   │   └── Footer: "Have account? Login"
│   └── Optional: Social login buttons (Google, Apple)
└── Success message (after submission)
```

**Features:**
- Tab switching (smooth transition)
- Form validation (real-time feedback)
- Password visibility toggle
- Responsive (full-width on mobile, centered on desktop)
- Keyboard navigation (Tab to fields, Enter to submit)
- Close on Escape key

**State Management:**
- useModal hook (open/close)
- Form state for login/register
- Error messages

**Backend Integration:**
- Submit to `/register` endpoint (GuestControllers)
- Submit to `/login` endpoint (Sanctum)
- Validation on both client & server

---

## 🚀 DEVELOPMENT SEQUENCE

### Phase 1: Foundation (Week 1)
**Priority: P0**

1. ✅ Set up shared components:
   - NavigationBar.tsx (styles, structure, mobile menu)
   - Footer.tsx (layout, links, styling)
   - CTAModal.tsx (basic structure, form fields)

2. ✅ Create color/typography system:
   - Global CSS variables for colors
   - Font imports (Playfair, Inter, Poppins)
   - Utility classes for spacing, sizing

3. ✅ Home page framework:
   - HeroSection (basic layout + CTA buttons)
   - MissionSection
   - FeaturesGridSection
   - Structure ready for animations

4. ✅ Routes setup:
   - Define all routes in routes/web.php
   - Create controllers (empty stubs)
   - Test navigation between pages

---

### Phase 2: Core Pages (Week 2-3)
**Priority: P1**

1. ✅ Complete Home page:
   - Add all sections
   - Implement animations (fade-in, parallax)
   - Optimize hero background (Lottie or CSS)

2. ✅ About page:
   - Section layout
   - Team member cards
   - Timeline visualization

3. ✅ Features page:
   - Feature group cards
   - Interactive elements (accordion/tabs)
   - Icon/illustration integration

4. ✅ How It Works page:
   - Timeline design
   - Step cards with alternating layout
   - Scroll animations

5. ✅ Family Explorer page:
   - Search bar + filters
   - Family card grid
   - Backend: FamilyRepository, FamilyExplorerService
   - Pagination or infinite scroll

6. ✅ Family Preview page:
   - Family profile layout
   - Blurred member preview
   - CTA overlays

---

### Phase 3: Content Pages (Week 4)
**Priority: P2**

1. ✅ Blog page:
   - Blog card grid
   - Search + filter functionality
   - Sidebar (categories, newsletter)
   - Backend: BlogRepository, BlogService

2. ✅ Blog detail page:
   - Article layout with rich text
   - Author card
   - Related posts
   - Social share buttons

3. ✅ Contact page:
   - Contact form
   - Form validation + submission
   - Backend: ContactService, email notifications

---

### Phase 4: Polish & Optimization (Week 5)
**Priority: P1+ (ongoing)**

1. ✅ Performance optimization:
   - Image optimization (WebP, responsive images)
   - Code splitting (lazy load pages)
   - Bundle size analysis

2. ✅ Accessibility audit:
   - WCAG 2.1 AA compliance check
   - Keyboard navigation test
   - Screen reader test (NVDA, JAWS)

3. ✅ SEO optimization:
   - Meta tags for each page
   - Schema.org markup
   - Sitemap generation
   - Robots.txt

4. ✅ Mobile responsiveness:
   - Test on actual devices (iOS, Android)
   - Fix any viewport issues
   - Touch-friendly sizes (48px minimum)

5. ✅ Cross-browser testing:
   - Chrome, Firefox, Safari, Edge
   - IE11 (if needed, graceful degradation)

6. ✅ Form validation & security:
   - CSRF token validation
   - XSS protection
   - SQL injection prevention (backend)

---

## 📦 DEPENDENCIES & LIBRARIES

### Frontend Dependencies (Already in package.json)

```
Essential:
  ✅ react: ^18.2.0
  ✅ react-dom: ^18.2.0
  ✅ @inertiajs/react: ^2.2.7
  ✅ bootstrap: ^5.3.7
  ✅ react-bootstrap: ^2.10.10
  ✅ axios: ^1.6.4

For Animations:
  ⚠️ Add: lottie-react (for hero animations)
  ⚠️ Add: react-intersection-observer (for scroll animations)
  ✅ Existing: react-slick (carousels)

For Forms:
  ⚠️ Add: react-hook-form (form management)
  ⚠️ Add: zod (form validation)

For Notifications:
  ✅ Existing: react-hot-toast (success messages, errors)

For Icons:
  ✅ Existing: bootstrap-icons, lucide-react

For Data Visualization:
  ✅ Existing: recharts (if needed for stats)

For SEO:
  ⚠️ Add: react-helmet-async (manage head tags)

For Utilities:
  ✅ Existing: dayjs (date formatting)
```

### Backend Dependencies (Already in composer.json)

```
Essential:
  ✅ laravel/framework: ^10.10
  ✅ laravel/sanctum: ^3.3 (auth)
  ✅ inertiajs/inertia-laravel: ^2.0
  ✅ tightenco/ziggy: ^2.5 (route helpers)

For Services/Repositories:
  ⚠️ Add: spatie/laravel-query-builder (advanced filtering)
  ⚠️ Add: spatie/laravel-sluggable (auto slugs for families, posts)

For Search:
  ⚠️ Add: laravel/scout (full-text search, optional)
  ⚠️ Alternative: Use simple Eloquent queries with LIKE

For Emails:
  ✅ Existing: Laravel Mail (for contact form)

Testing:
  ✅ Existing: phpunit/phpunit, mockery/mockery

Code Quality:
  ✅ Existing: laravel/pint (formatting)
```

---

## 🧪 TESTING STRATEGY

### Frontend Testing

**Unit Tests (Page Components):**
- Test each page component renders without error
- Test CTA buttons navigate correctly
- Test form validation (Contact form, CTAModal)

**Integration Tests:**
- Test page transitions (routing)
- Test CTAModal opens/closes correctly
- Test form submission flow (success/error)

**E2E Tests (Cypress/Playwright):**
- User flow: Home → Features → Sign Up → Confirmation
- Blog search/filter functionality
- Family Explorer search & filter
- Mobile navigation (hamburger menu)

**Accessibility Testing:**
- Automated: axe DevTools, Lighthouse
- Manual: Keyboard navigation, screen reader (NVDA)
- Color contrast check

### Backend Testing

**Unit Tests:**
- Repository methods (find, all, create, update, delete)
- Service methods (business logic)
- Validation logic

**Feature Tests:**
- Test contact form submission
- Test family explorer search
- Test blog post retrieval

**API Tests:**
- Test endpoints return correct data structure
- Test authentication requirements
- Test error handling (404, 500, validation errors)

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Foundation

- [ ] Color/typography system setup
- [ ] NavigationBar component
  - [ ] Desktop menu
  - [ ] Mobile hamburger
  - [ ] Active route highlighting
  - [ ] Sticky behavior on scroll
- [ ] Footer component
  - [ ] Multi-column layout
  - [ ] Links and copyright
  - [ ] Social media links
  - [ ] Newsletter signup
- [ ] CTAModal component
  - [ ] Login tab
  - [ ] Register tab
  - [ ] Form fields & validation
  - [ ] Close button, keyboard escape
  - [ ] Integration with router (modal state)
- [ ] Routes setup
  - [ ] All guest routes defined
  - [ ] Controllers created (stubs)
  - [ ] Inertia::render() calls added

### Phase 2: Core Pages

**Home Page:**
- [ ] HeroSection (background, headline, CTAs)
  - [ ] Animated background (Lottie JSON chosen)
  - [ ] Parallax on scroll
  - [ ] CTA button linking to CTAModal
- [ ] MissionSection
- [ ] HowItWorksSection (3-step cards)
- [ ] FamilyShowcaseSection (carousel)
- [ ] FeaturesGridSection (6-card grid)
- [ ] TestimonialsSection (carousel)
- [ ] CTAFooterSection

**About Page:**
- [ ] MissionSection
- [ ] StorySection
- [ ] VisionSection (timeline optional)
- [ ] TeamSection (team member cards)
- [ ] CTASection

**Features Page:**
- [ ] PageHeader
- [ ] FamilyCreationSection
- [ ] MarriageLinksSection
- [ ] LegacyPreservationSection
- [ ] SocialEventsSection
- [ ] CTA buttons linking to signup

**How It Works Page:**
- [ ] PageHeader
- [ ] 5 StepCards with timeline
- [ ] Alternating layout (image + text)
- [ ] Scroll animations

**Family Explorer Page:**
- [ ] SearchBar component
- [ ] FilterPanel (state, tribe, sort)
- [ ] FamilyCard grid
- [ ] Pagination
- [ ] Empty state (no results found)
- [ ] Backend: FamilyRepository, FamilyExplorerService

**Family Preview Page:**
- [ ] FamilyBanner
- [ ] OriginInfo section
- [ ] FamilyHeadCard
- [ ] MembersPreview (blurred/limited)
- [ ] CTAOverlay
- [ ] RelatedFamilies (optional)
- [ ] Backend: Query family data with privacy checks

### Phase 3: Content Pages

**Blog Page:**
- [ ] BlogCard component
- [ ] Grid layout (12 cards per page)
- [ ] SearchBar (debounced)
- [ ] FilterTabs (by category)
- [ ] Pagination
- [ ] BlogSidebar (recent, popular, newsletter)
- [ ] Backend: BlogRepository, BlogService

**Blog Detail Page:**
- [ ] Article header (title, image, meta)
- [ ] Rich text content (HTML rendering)
- [ ] AuthorCard
- [ ] RelatedPosts (3-4 carousel)
- [ ] SocialShare buttons
- [ ] Newsletter signup
- [ ] Backend: Query single blog post, related posts

**Contact Page:**
- [ ] ContactForm
  - [ ] Fields: name, email, subject, message
  - [ ] Client-side validation
  - [ ] Submitted state + success message
- [ ] ContactInfo (right side)
  - [ ] Address, email, phone
  - [ ] Office hours
  - [ ] Social links
- [ ] EmbeddedMap (optional)
- [ ] Backend: ContactService, email sending

### Phase 4: Polish & Optimization

- [ ] Image optimization
  - [ ] Hero background (WebP, responsive)
  - [ ] Family showcase images
  - [ ] Blog featured images
  - [ ] Team member photos
- [ ] Performance
  - [ ] Code splitting for lazy page loads
  - [ ] Webpack/Vite bundle analysis
  - [ ] Remove unused CSS/JS
- [ ] SEO
  - [ ] Meta tags on all pages
  - [ ] Open Graph tags for sharing
  - [ ] Schema.org markup (Article, Organization, LocalBusiness)
  - [ ] Sitemap.xml generation
  - [ ] Robots.txt
- [ ] Accessibility
  - [ ] WCAG 2.1 AA compliance
  - [ ] Keyboard navigation (Tab, Enter, Escape)
  - [ ] Screen reader testing (NVDA, JAWS)
  - [ ] Color contrast ratios
  - [ ] ARIA labels on complex components
- [ ] Mobile responsiveness
  - [ ] Test on iPhone 12, 14, Galaxy S21, etc.
  - [ ] Touch targets 48px minimum
  - [ ] Hamburger menu usability
  - [ ] Form inputs mobile-friendly
- [ ] Form validation & security
  - [ ] CSRF protection (tokens in forms)
  - [ ] XSS prevention (escape HTML)
  - [ ] Email validation (contact form)
  - [ ] Rate limiting on contact form (backend)
- [ ] Cross-browser testing
  - [ ] Chrome latest
  - [ ] Firefox latest
  - [ ] Safari latest
  - [ ] Edge latest

---

## 📝 DATA MODELS

### Family Model

```php
$table->id();
$table->string('name'); // Family name
$table->string('slug')->unique(); // URL slug
$table->text('description');
$table->string('state'); // Nigerian state
$table->string('lga')->nullable(); // Local Government Area
$table->string('village')->nullable();
$table->string('tribe')->nullable();
$table->foreignId('founder_id')->references('id')->on('users');
$table->integer('member_count');
$table->year('founded_year')->nullable();
$table->string('cover_image')->nullable();
$table->enum('privacy', ['public', 'private', 'invited'])->default('private');
$table->timestamps();
```

### BlogPost Model

```php
$table->id();
$table->string('title');
$table->string('slug')->unique();
$table->text('excerpt');
$table->longText('content');
$table->string('category');
$table->string('featured_image')->nullable();
$table->foreignId('author_id')->references('id')->on('users');
$table->integer('view_count')->default(0);
$table->timestamp('published_at')->nullable();
$table->timestamps();
```

### Contact Model (for form submissions)

```php
$table->id();
$table->string('name');
$table->string('email');
$table->string('subject');
$table->text('message');
$table->enum('status', ['new', 'read', 'replied'])->default('new');
$table->timestamps();
```

---

## 🎨 Design File References

**For developer reference, the design should align with:**
- Figma/Adobe XD mockups (TBD: to be provided)
- Color palette as defined above
- Typography scale as defined above
- Component library with detailed specs

---

## 🔗 INTEGRATION POINTS

### Routing

All routes defined in `routes/web.php`:
```php
// Guest routes (public)
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

// Auth routes (handled by Laravel Sanctum/Inertia)
Route::post('/register', ...)->name('register');
Route::post('/login', ...)->name('login');
```

### State Management

- Use React Context for:
  - User auth state (from `usePage().props`)
  - CTAModal visibility
  - Global toast notifications

- Use Local State for:
  - Form inputs
  - Filter/search state (Family Explorer, Blog)
  - Carousel current slide

### Environment Variables

```
VITE_APP_NAME=FamTree
VITE_APP_URL=http://localhost

APP_NAME=FamTree
APP_ENV=local
DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=famtree

MAIL_DRIVER=mailpit
MAIL_HOST=mailpit
MAIL_PORT=1025
```

---

## 📞 SUPPORT & REFERENCES

### Key Documentation to Reference
- PROJECT_STARTUP.md (this requirements doc)
- CLAUDE.md (development guidelines)
- Laravel Inertia docs: https://inertiajs.com
- Bootstrap components: https://react-bootstrap.github.io
- React patterns: https://react.dev

### Common Issues & Solutions

**Issue:** Modal not opening
**Solution:** Check CTAModal context is provided at root; useModal hook is called correctly

**Issue:** Images not loading
**Solution:** Check image paths (public/ vs resources/); use asset() helper in Blade

**Issue:** Animations not smooth
**Solution:** Use CSS will-change, requestAnimationFrame; avoid layout thrashing

**Issue:** SEO meta tags not rendering
**Solution:** Use react-helmet-async; ensure tags set before page render

---

## ✅ FINAL DELIVERABLES

By end of implementation:
1. ✅ All 9 pages fully functional
2. ✅ Responsive design (mobile, tablet, desktop)
3. ✅ All CTAs working (links, modals, forms)
4. ✅ SEO optimized (meta tags, schema markup)
5. ✅ Accessible (WCAG 2.1 AA)
6. ✅ Performance optimized (Lighthouse 90+)
7. ✅ Unit & integration tests
8. ✅ Documentation (code comments, Storybook optional)
9. ✅ Deployed to staging environment

---

**End of IMPLEMENTATION_PLAN.md**
