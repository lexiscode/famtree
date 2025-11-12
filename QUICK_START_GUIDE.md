# 🚀 QUICK START GUIDE - FAMTREE GUEST PAGES DEVELOPMENT

**For developers just getting started on this project**

---

## 📚 READ THESE FIRST (In Order)

1. **PROJECT_STARTUP.md** ← Original vision & design brief (5 min read)
2. **DESIGN_ENHANCEMENTS.md** ← How we're improving it (10 min read)
3. **IMPLEMENTATION_PLAN.md** ← Technical architecture & strategy (20 min read)
4. **DEVELOPMENT_TODOS.md** ← Your daily checklist (reference as you work)
5. **CLAUDE.md** ← Development guidelines (reference during coding)

---

## 🎯 YOUR MISSION

Build 9 beautiful, responsive, accessible guest-facing pages for FamTree:

1. **Home (Landing)** — Hero + Features + Testimonials
2. **About** — Mission, Vision, Team
3. **Features** — Feature showcase with categories
4. **How It Works** — 5-step process visualization
5. **Blog** — Article listing with search/filter
6. **Blog Detail** — Single article view
7. **Contact** — Contact form + info
8. **Public Family Explorer** — Search & browse families
9. **Family Profile Preview** — Sample family public profile

---

## 🛠️ TECH STACK RECAP

**Frontend:**
- React 18 + TypeScript
- Inertia.js (server-side rendering)
- Bootstrap 5 + React Bootstrap
- Vite (build tool)
- Playfair Display + Inter + Poppins (fonts)

**Backend:**
- Laravel 10 (PHP 8.2)
- Eloquent ORM
- Laravel Sanctum (auth)
- Service + Repository pattern

**Databases:**
- MySQL 8.0 (main)
- Redis (caching)

**Tools:**
- Docker Compose + Laravel Sail
- npm/yarn (frontend dependencies)
- Composer (PHP dependencies)

---

## 🚀 PROJECT SETUP (First Time Only)

### 1. Install Dependencies

```bash
# Frontend
./sail npm install

# Backend
./sail composer install
```

### 2. Setup Environment

```bash
# Copy example
cp .env.example .env

# Generate app key
./sail artisan key:generate
```

### 3. Start Servers

```bash
# In terminal 1: Laravel server (automatic in Docker)
docker-compose up -d

# In terminal 2: Vite dev server
./sail npm run dev
```

Visit: http://localhost

---

## 📂 KEY FILE STRUCTURE

```
resources/
├── js/
│   ├── app.tsx ← Entry point
│   ├── Pages/
│   │   └── GuestPages/ ← You'll create pages here
│   │       ├── Home/Index.tsx
│   │       ├── About/Index.tsx
│   │       └── ...
│   ├── Components/
│   │   └── Navigation/ ← Shared components
│   │       └── NavigationBar.tsx
│   └── types/
│       └── inertia.d.ts ← Type definitions
├── css/
│   ├── app.css
│   ├── variables.css ← You'll create color/spacing vars
│   └── globals.css ← Base styles
└── views/
    └── app.blade.php ← Root HTML

app/
├── Http/
│   └── Controllers/
│       └── GuestControllers/ ← You'll create controllers here
│           ├── HomeController.php
│           ├── BlogController.php
│           └── ...
├── Actions/
│   └── GuestServices/ ← Business logic
│       ├── BlogService.php
│       └── ...
└── Repositories/
    └── GuestRepositories/ ← Data access
        ├── BlogRepository.php
        └── ...

routes/
└── web.php ← Define all guest routes here
```

---

## 🎨 DESIGN TOKENS (Copy This!)

### Colors

```css
/* Primary */
--color-gold: #D4A574;
--color-blue: #1B3A52;
--color-brown: #8B6F47;

/* Secondary */
--color-cream: #FFF8F0;
--color-green: #7BA77F;
--color-gray: #A8A4A4;

/* Text */
--color-text-primary: #2C2C2C;
--color-text-secondary: #666666;
--color-text-accent: #D4A574;
```

### Typography

```css
/* Fonts */
--font-display: 'Playfair Display', serif;
--font-body: 'Inter', sans-serif;
--font-accent: 'Poppins', sans-serif;

/* Sizes */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
--text-5xl: 3rem;
```

### Spacing (8px unit system)

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

---

## 📋 DEVELOPMENT WORKFLOW

### Phase 1: Setup (Day 1)
- [ ] Install packages
- [ ] Create design system (CSS variables)
- [ ] Create shared components (Navigation, Footer, CTAModal)
- [ ] Setup routes and empty controllers

### Phase 2: Build Pages (Days 2-5)
- [ ] Home page + sections
- [ ] About, Features, How It Works pages
- [ ] Family Explorer + Family Preview
- [ ] Blog listing + Blog detail

### Phase 3: Content & Polish (Days 6-7)
- [ ] Add contact page & form handling
- [ ] Add sample data (families, blog posts)
- [ ] Optimize images
- [ ] Test responsive design

### Phase 4: Optimization (Day 8)
- [ ] Performance (Lighthouse 90+)
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] SEO (meta tags, schema markup)
- [ ] Cross-browser testing

---

## 💻 COMMON COMMANDS

### Development

```bash
# Start all services
docker-compose up -d

# Vite dev server (auto-reload)
./sail npm run dev

# Production build
./sail npm run build

# Create a controller
./sail artisan make:controller GuestControllers/HomeController

# Create a model
./sail artisan make:model BlogPost -m

# Run migrations
./sail artisan migrate

# Laravel tinker (interactive shell)
./sail artisan tinker

# Clear caches
./sail artisan cache:clear
./sail artisan config:clear
./sail artisan view:clear
```

### Testing

```bash
# Run all tests
./sail artisan test

# Run specific test
./sail artisan test tests/Feature/BlogTest.php

# Run with coverage
./sail artisan test --coverage
```

### Code Quality

```bash
# Format PHP code
./sail pint

# Check for issues (linting)
./sail npm run lint  # (if configured)
```

---

## 🔗 ROUTING EXAMPLE

**In `routes/web.php`:**

```php
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.show');
```

**In `GuestControllers/HomeController.php`:**

```php
<?php
namespace App\Http\Controllers\GuestControllers;

use Inertia\Inertia;

class HomeController
{
    public function index()
    {
        // Get data from service if needed
        $testimonials = [...]; // hardcode or fetch

        return Inertia::render('GuestPages/Home/Index', [
            'testimonials' => $testimonials,
        ]);
    }
}
```

**In `resources/js/Pages/GuestPages/Home/Index.tsx`:**

```typescript
import { usePage } from '@inertiajs/react';

interface Props {
    testimonials: Array;
}

export default function Home({ testimonials }: Props) {
    return (
        <div>
            {/* Your components here */}
        </div>
    );
}
```

---

## 🎯 KEY PRINCIPLES

### 1. Components are Isolated
Each component should work independently. Test in Storybook or create a demo page.

### 2. Data Flows One Direction
```
Backend (Service) → React Component Props → Component Renders
```

### 3. Reuse Components
If you write a card component, use it everywhere (features, families, blog).

### 4. Mobile First
Design for 320px width first, then enhance for larger screens.

### 5. Accessibility First
Every interactive element should be keyboard-navigable and screen-reader-friendly.

### 6. SEO Matters
Every page needs meta tags, open graph tags, and schema markup.

---

## 🚨 COMMON PITFALLS

### ❌ Don't
- Put business logic in React components
- Query database directly in controllers
- Hardcode colors/sizes (use CSS variables)
- Forget to add ARIA labels
- Ignore responsive design on mobile
- Skip CSRF tokens on forms

### ✅ Do
- Use services for business logic
- Use repositories for data access
- Use CSS variables for theming
- Always add accessibility attributes
- Test mobile first (use DevTools)
- Include CSRF tokens on all forms

---

## 🔍 TESTING YOUR WORK

### Manual Testing
1. Desktop (1920x1080) → Chrome, Firefox, Safari, Edge
2. Tablet (768x1024) → Chrome DevTools
3. Mobile (375x667) → Chrome DevTools, then real device
4. Keyboard navigation → Tab through all elements
5. Screen reader → NVDA (Windows) or VoiceOver (Mac)

### Browser DevTools
```
F12 → DevTools →
  Console (check for errors)
  Network (check file sizes)
  Lighthouse (performance/accessibility/SEO)
  Responsive Design (mobile testing)
```

### Lighthouse Audit
```
DevTools → Lighthouse → Generate report
Target:
  Performance: 90+
  Accessibility: 95+
  Best Practices: 90+
  SEO: 95+
```

---

## 📞 WHEN YOU GET STUCK

1. **Check IMPLEMENTATION_PLAN.md** — detailed breakdown of each page
2. **Check DEVELOPMENT_TODOS.md** — step-by-step instructions
3. **Check CLAUDE.md** — development guidelines and patterns
4. **Check Examples in the Repo** — existing code often has patterns
5. **Search Google/ChatGPT** — odds are someone solved it before

---

## 📈 PROGRESS TRACKING

Print this checklist and track your progress:

- [ ] Phase 1: Foundation (Week 1)
  - [ ] Setup design system
  - [ ] Create shared components
  - [ ] Setup routes

- [ ] Phase 2: Core Pages (Weeks 2-3)
  - [ ] Home page
  - [ ] About, Features, How It Works
  - [ ] Family Explorer, Family Preview

- [ ] Phase 3: Content (Week 4)
  - [ ] Blog pages
  - [ ] Contact page

- [ ] Phase 4: Polish (Week 5)
  - [ ] Performance
  - [ ] Accessibility
  - [ ] SEO
  - [ ] Testing

---

## 🎓 LEARNING RESOURCES

- [React Documentation](https://react.dev)
- [Inertia.js Docs](https://inertiajs.com)
- [Laravel Docs](https://laravel.com/docs)
- [Bootstrap Docs](https://getbootstrap.com)
- [Web Accessibility (MDN)](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [SEO Starter Guide (Google)](https://developers.google.com/search/docs)

---

## 🎉 YOU'VE GOT THIS!

This is a 5-8 week project for one developer, but the payoff is huge:
- Beautiful, professional platform
- Accessible to all users
- Optimized for search engines
- Secure and performant
- Ready to scale

Start with Phase 1, Task 1.1 in DEVELOPMENT_TODOS.md and build methodically. Good luck! 🚀

---

**Questions?** Re-read the docs. The answer is in there. 📚
