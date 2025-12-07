# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FamTree is a Laravel 10 + React 18 + Inertia.js full-stack web application for managing family trees. The project follows a modern monolithic architecture with a clear separation between backend (PHP/Laravel) and frontend (React/TypeScript).

The application uses **Laravel Sail** (Docker-based) for local development, with separate directory structures for guest and admin features. The codebase is organized into AdminPages/AdminControllers and GuestPages/GuestControllers to keep concerns isolated.

## Quick Start

### Essential Commands

**Using docker-compose directly:**
```bash
docker-compose exec -it famtree php artisan migrate           # Run migrations
docker-compose exec -it famtree npm run dev                   # Start Vite dev server
docker-compose exec -it famtree bash                          # Enter container shell
docker-compose exec mysql mysql -u root -p famtree            # Direct MySQL access
```

**Docker Service Management:**
```bash
docker-compose up -d                 # Start all services
docker-compose down                  # Stop all services
docker-compose ps                    # Show running containers
docker-compose logs -f famtree       # View app logs
```

**Access Points:**
- App: `http://localhost` (requires server port 80)
- PhpMyAdmin: `http://localhost:8080`
- Mailpit (Email testing): `http://localhost:8025`
- MySQL: `localhost:3306`
- Redis: `localhost:6379`

## Architecture Overview

### Backend Structure (Laravel)

**Key Directories:**
- `/app/Http/Controllers/AdminControllers/` - Admin panel request handlers
- `/app/Http/Controllers/GuestControllers/` - Guest/public area request handlers
  - `AuthAccessControllers/` - Controllers for authenticated user pages (dashboard, profile, etc.)
- `/app/Http/Controllers/Controller.php` - Base controller class
- `/app/Models/` - Eloquent models
- `/app/Http/Middleware/` - Request/response middleware (HandleInertiaRequests.php for props sharing)
- `/app/Http/Requests/` - Form request validation classes (organized by context)
  - `GuestRequests/` - Guest/public form requests
  - `GuestRequests/AuthAccessRequests/` - Form requests for authenticated user pages
- `/app/Actions/AdminServices/` - Admin business logic and service classes
- `/app/Actions/GuestServices/` - Guest/public business logic and service classes
  - `AuthAccessServices/` - Services for authenticated user pages
- `/app/Repositories/AdminRepositories/` - Data access layer for admin features
- `/app/Repositories/GuestRepositories/` - Data access layer for guest features
  - `AuthAccessRepositories/` - Repositories for authenticated user pages
- `/app/Providers/` - Service registration and bootstrapping
- `/routes/web.php` - Web routes with Inertia page rendering (API routes in routes/api.php if needed)
- `/database/migrations/` - Database schema changes
- `/database/factories/` - Model factories for testing
- `/database/seeders/` - Database seed files
- `/config/` - Application configuration (auth.php defines guards: admin and default)

**Inertia Middleware** (`app/Http/Middleware/HandleInertiaRequests.php`):
- Integrates server-side rendering of React components
- Shares authentication state, user info, and flash messages
- All data passed here is available to frontend components via `$page.props`

**Authentication:**
- Dual authentication setup: `default` guard (user) and `admin` guard (admin users)
- Session-based auth for web routes (user login/register via `/login`, `/register`, `/logout`)
- User model includes password hashing via casts
- Both user and admin auth states available in HandleInertiaRequests.php
- Form request validation classes for login/register in `/app/Http/Requests/GuestRequests/`
- AuthService handles business logic (registration, login, user data retrieval)
- UserRepository abstracts database access for user operations

**Database:**
- MySQL 8.0 with migrations in `/database/migrations/`
- Users table is the primary model (created by default)
- Migrations run with `php artisan migrate`

### Frontend Structure (React/TypeScript)

**Key Directories:**
- `/resources/js/Pages/AdminPages/` - Admin panel page components
- `/resources/js/Pages/GuestPages/` - Guest/public area page components
  - `AuthAccessPages/` - Pages for authenticated guest users (dashboard, profile, settings, etc.)
- `/resources/js/Layouts/` - Layout wrappers (AdminLayout.tsx and GuestLayout.tsx)
- `/resources/js/Components/` - Reusable shared components
- `/resources/js/types/inertia.d.ts` - TypeScript type definitions for props
- `/resources/css/` - Global styles
- `/resources/views/app.blade.php` - Root HTML template

**Entry Point** (`resources/js/app.tsx`):
- Initializes React with Inertia.js adapter
- Auto-resolves pages from `/Pages/**/*.tsx`
- Bootstrap CSS/JS and Google Fonts loaded via CDN
- Vite handles HMR (hot module replacement)

**Type Safety:**
- Global types in `/resources/js/types/inertia.d.ts`:
  - Auth structure: `auth.user` (regular user: id, first_name, last_name, username, email) and `auth.admin` (admin user)
  - `CustomPageProps` extends Inertia PageProps with typed auth and flash messages
- TypeScript strict mode enabled in `tsconfig.json`
- Path aliases: `@/*` maps to `resources/js/*`

**Inertia.js Communication:**
- Pages receive props from Laravel backend via Inertia
- Use `usePage()` hook to access `$page.props`
- Properties shared in HandleInertiaRequests middleware are automatically typed

**UI Framework & Libraries:**
- Bootstrap 5 (loaded via npm and CSS imported in app.tsx)
- React Bootstrap (react-bootstrap) for component library
- Bootstrap Icons (bootstrap-icons) available
- Lucide React icons available
- Recharts for data visualization
- React Slick for carousels
- React Toast Notifications (react-toastify, react-hot-toast)

### Key Integrations

**Inertia.js Server-Side Rendering:**
- Backend returns React components from controllers using `Inertia::render('PageName', $data)`
- Frontend components receive data as props
- Type-safe backend-to-frontend communication
- Single-page app (SPA) experience with full-page transitions

**API Authentication:**
- Laravel Sanctum tokens for API routes
- Token refresh available via Sanctum
- CSRF protection automatic for web routes

**Email Testing:**
- Mailpit container listens on port 1025 (SMTP)
- Web UI at `http://localhost:8025`
- All emails sent during development captured here

**Additional Features:**
- Redis available for caching and queues
- Mailpit for email testing (SMTP on port 1025, Web UI on 8025)
- PDF export libraries available (jspdf, html2canvas, html-to-image)
- React Router DOM (react-router-dom) for additional routing if needed

## Service + Repository Pattern

This application follows the **Service + Repository** architectural pattern for clean separation of concerns:

**Data Flow (Request → Response):**
```
HTTP Request
    ↓
Route → Controller
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
Eloquent Model
    ↓
Database
    ↓
Model → Repository
    ↓
Service (Transform Data)
    ↓
Controller (Pass to View)
    ↓
Inertia::render() → React Component
```

**Key Principles:**
- **Controllers**: Route handling and response building only
- **Services**: Business logic, validation, calculations, orchestration
- **Repositories**: Abstract all database queries and model access
- **Models**: Database schema representation only

**Dependency Injection Flow:**
```
Controller injects Service
    Service injects Repository
        Repository uses Model
```

## Development Workflow

### Creating New Features

**1. Determine the feature context and choose the appropriate directory structure:**

- **Admin Features**: Use AdminControllers, AdminServices, AdminRepositories, and AdminPages
  - Example: `Admin Dashboard` → AdminControllers/DashboardController.php

- **Public/Guest Features** (unauthenticated only): Use GuestControllers, GuestServices, GuestRepositories, and GuestPages
  - Example: `Blog` → GuestControllers/BlogController.php, GuestPages/Blog/
  - Middleware: `['web', 'guest']`

- **Authenticated User Features** (logged-in users only): Use GuestControllers/AuthAccessControllers/, GuestServices/AuthAccessServices/, etc.
  - Example: `User Profile` → GuestControllers/AuthAccessControllers/ProfileController.php, GuestPages/AuthAccessPages/Profile/
  - Middleware: `['web', 'auth']`

**2. Create the Database Model:**
```bash
./sail artisan make:model FamilyMember -m  # Creates model and migration
# Edit migration in database/migrations/
./sail artisan migrate
```

**3. Create Repository (Data Access Layer):**
```php
// app/Repositories/AdminRepositories/FamilyMemberRepository.php
namespace App\Repositories\AdminRepositories;
use App\Models\FamilyMember;

class FamilyMemberRepository
{
    public function all() { return FamilyMember::all(); }
    public function find(int $id) { return FamilyMember::findOrFail($id); }
    public function create(array $data) { return FamilyMember::create($data); }
    public function update(int $id, array $data) { /* ... */ }
    public function delete(int $id) { /* ... */ }
}
```

**4. Create Service (Business Logic):**
```php
// app/Actions/AdminServices/FamilyMemberService.php
namespace App\Actions\AdminServices;
use App\Repositories\AdminRepositories\FamilyMemberRepository;

class FamilyMemberService
{
    public function __construct(private FamilyMemberRepository $repo) {}

    public function getAllMembers() { return $this->repo->all(); }
    public function createMember(array $data) { /* validation + logic */ return $this->repo->create($data); }
}
```

**5. Create Controller:**
```php
// app/Http/Controllers/AdminControllers/FamilyMemberController.php
use App\Actions\AdminServices\FamilyMemberService;

class FamilyMemberController
{
    public function __construct(private FamilyMemberService $service) {}

    public function index()
    {
        $members = $this->service->getAllMembers();
        return Inertia::render('AdminPages/FamilyMembers/Index', ['members' => $members]);
    }
}
```

**6. Create Routes:**
```php
// In routes/web.php
Route::middleware(['auth:admin'])->group(function () {
    Route::get('/family-members', [FamilyMemberController::class, 'index']);
});
```

**7. Create Frontend Page Component:**
```typescript
// resources/js/Pages/AdminPages/FamilyMembers/Index.tsx
import AdminLayout from '@/Layouts/AdminLayout';

interface Member {
    id: number;
    name: string;
}

interface Props {
    members: Member[];
}

export default function Index({ members }: Props) {
    return (
        <AdminLayout>
            {/* Render members */}
        </AdminLayout>
    );
}
```

### Testing

**PHPUnit (Backend):**
- Unit tests: `/tests/Unit/`
- Feature tests: `/tests/Feature/`
- Run all tests: `./sail artisan test`
- Run single test file: `./sail artisan test tests/Feature/ExampleTest.php`
- Run with specific filter: `./sail artisan test --filter=MethodName`

**Test Helpers:**
- Faker for generating test data (fakerphp/faker)
- Mockery for mocking (mockery/mockery)
- Laravel's testing traits in `/tests/TestCase.php`
- Database transactions and refreshing available in test setup

## Authentication System

The authentication system is implemented using Inertia.js form submissions with Laravel session-based authentication:

**User Registration & Login Flow:**
1. Frontend CTAModal component (`resources/js/Components/Modal/CTAModal.tsx`) collects form data
2. Client-side validation with react-hook-form + zod schemas
3. Form submission via `router.post()` to `/register` or `/login` endpoints
4. Backend form request classes validate input (RegisterRequest, LoginRequest)
5. AuthService handles business logic and duplicate user detection
6. AuthController authenticates user and redirects to home with flash message
7. HandleInertiaRequests middleware shares updated auth state to frontend

**Key Files:**
- **Frontend**: `resources/js/Components/Modal/CTAModal.tsx` - Modal with login/register forms
- **Backend Controller**: `app/Http/Controllers/GuestControllers/AuthController.php` - Handles login/register/logout
- **Service Layer**: `app/Actions/GuestServices/AuthService.php` - Registration and login logic
- **Repository Layer**: `app/Repositories/GuestRepositories/UserRepository.php` - User database operations
- **Request Validation**: `app/Http/Requests/GuestRequests/LoginRequest.php`, `RegisterRequest.php`
- **Routes**: `/register` (POST), `/login` (POST), `/logout` (POST in authenticated routes)

**Important Notes:**
- User passwords must contain: uppercase, lowercase, number, minimum 8 characters
- Email and username must be unique (validated in both request and service layer)
- Remember me functionality available on login form
- After registration, user is auto-logged in
- All form submissions handled through Inertia's router (no JSON API)
- Flash messages for success/error automatically available via $page.props.flash

**ModalContext** (`resources/js/Context/ModalContext.tsx`):
- Global state management for login/register modal visibility
- Used by NavigationBar to trigger login/register modals
- Wraps GuestLayout with ModalProvider for context availability

## Inertia.js & Type Safety

### Component Props Pattern

```typescript
// resources/js/Pages/GuestPages/FamilyMembers/Index.tsx
import { useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

interface Member {
    id: number;
    name: string;
    // other fields...
}

interface Props {
    members: Member[];
}

export default function Index({ members }: Props) {
    const { props } = usePage();
    const { auth } = props; // Shared from HandleInertiaRequests
    const user = auth?.user; // Regular user

    const handleCreate = useCallback(() => {
        router.post('/family', { name: 'John' });
    }, []);

    return (
        <GuestLayout>
            {members.map(member => (
                <div key={member.id}>{member.name}</div>
            ))}
        </GuestLayout>
    );
}
```

### Sharing Data from Backend

The HandleInertiaRequests.php middleware automatically shares auth state and flash messages:

```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    $user = auth()->user();

    return [
        ...parent::share($request),
        'auth' => [
            'admin' => auth()->guard('admin')->user(),  // Admin user (null if not admin)
            'user' => $user ? [                          // Regular user
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'username' => $user->username,
                'email' => $user->email,
            ] : null,
        ],
        'flash' => [
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
        ],
    ];
}
```

These props are automatically available in all pages via `usePage().props`. Always use TypeScript interfaces to type your page props.

## Code Organization Strategy

### Directory Structure Breakdown

The codebase uses a **context-based organization** to maintain clean separation of concerns:

**Three Main Contexts:**

1. **Admin** - Administrative panel (admin users only)
   - Location: `/AdminControllers/`, `/AdminServices/`, `/AdminRepositories/`, `/AdminPages/`
   - Guard: `auth:admin`
   - Purpose: Admin dashboard, user management, system settings

2. **Guest (Public)** - Public-facing pages (unauthenticated users)
   - Location: `/GuestControllers/`, `/GuestServices/`, `/GuestRepositories/`, `/GuestPages/`
   - Middleware: `guest` (unauthenticated only)
   - Purpose: Home, about, features, blog, contact, family explorer

3. **Guest AuthAccess** - User-specific pages (authenticated guest users only)
   - Location: `/GuestControllers/AuthAccessControllers/`, `/GuestServices/AuthAccessServices/`, `/GuestRepositories/AuthAccessRepositories/`, `/GuestPages/AuthAccessPages/`
   - Middleware: `auth` (authenticated users only)
   - Purpose: User dashboard, profile, family trees, settings, preferences

**Why This Organization?**
- **Clear Boundaries**: Each context has its own controllers, services, repositories, and pages
- **Middleware Clarity**: Easy to see which middleware applies (guest vs auth)
- **Feature Isolation**: Related features grouped together
- **Scalability**: New features naturally fit into appropriate directories

**Form Requests Organization:**
- `/GuestRequests/` - Public form requests (login, register, contact form)
- `/GuestRequests/AuthAccessRequests/` - Authenticated user form requests (profile updates, family tree modifications)

## Code Organization Guidelines

### Controllers
- Organize into three main directories:
  - `AdminControllers/` - Admin panel controllers (auth:admin middleware)
  - `GuestControllers/` - Public/unauthenticated guest controllers (guest middleware)
  - `GuestControllers/AuthAccessControllers/` - Authenticated user controllers (auth middleware)
- Keep controllers focused on request/response handling only
- Inject repositories or services via constructor dependency injection
- Never access models or database directly—delegate to repositories/services
- Return `Inertia::render()` for page views with typed data from services
- Render paths match directory structure:
  - `Inertia::render('AdminPages/...')` for admin pages
  - `Inertia::render('GuestPages/...')` for public guest pages
  - `Inertia::render('GuestPages/AuthAccessPages/...')` for authenticated user pages

Examples:
```php
// Admin: app/Http/Controllers/AdminControllers/DashboardController.php
namespace App\Http\Controllers\AdminControllers;
use App\Actions\AdminServices\DashboardService;

class DashboardController {
    public function __construct(private DashboardService $service) {}
    public function index() {
        return Inertia::render('AdminPages/Dashboard', ['stats' => $this->service->getStats()]);
    }
}

// Public Guest: app/Http/Controllers/GuestControllers/BlogController.php
namespace App\Http\Controllers\GuestControllers;
use App\Actions\GuestServices\BlogService;

class BlogController {
    public function __construct(private BlogService $service) {}
    public function index() {
        return Inertia::render('GuestPages/Blog/Index', ['posts' => $this->service->getAllPosts()]);
    }
}

// Authenticated User: app/Http/Controllers/GuestControllers/AuthAccessControllers/ProfileController.php
namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;
use App\Actions\GuestServices\AuthAccessServices\ProfileService;

class ProfileController {
    public function __construct(private ProfileService $service) {}
    public function show() {
        $user = auth()->user();
        return Inertia::render('GuestPages/AuthAccessPages/Profile', ['profile' => $this->service->getProfile($user)]);
    }
}
```

### Services (Business Logic)
- Located in `/app/Actions/AdminServices/`, `/app/Actions/GuestServices/`, or `/app/Actions/GuestServices/AuthAccessServices/`
- Contain all business logic, calculations, and data processing
- Inject repositories via constructor to access data
- Should be stateless and reusable
- One service per feature/entity (e.g., FamilyService, ProfileService)
- Handle complex operations and data transformations
- Can call other services if needed
- Match controller location: admin services for admin controllers, guest for public, AuthAccessServices for authenticated user features

Examples:
```php
// Admin: app/Actions/AdminServices/DashboardService.php
use App\Repositories\AdminRepositories\UserRepository;

class DashboardService {
    public function __construct(private UserRepository $userRepo) {}
    public function getStats() {
        return [
            'total_users' => $this->userRepo->count(),
            'active_today' => $this->userRepo->activeTodayCount(),
        ];
    }
}

// Public Guest: app/Actions/GuestServices/BlogService.php
use App\Repositories\GuestRepositories\BlogRepository;

class BlogService {
    public function __construct(private BlogRepository $blogRepo) {}
    public function getAllPosts() {
        return $this->blogRepo->all()->sortByDesc('published_at');
    }
}

// Authenticated User: app/Actions/GuestServices/AuthAccessServices/ProfileService.php
use App\Repositories\GuestRepositories\AuthAccessRepositories\ProfileRepository;

class ProfileService {
    public function __construct(private ProfileRepository $profileRepo) {}
    public function getProfile(User $user) {
        return $this->profileRepo->findByUser($user);
    }
}
```

### Repositories (Data Access)
- Located in `/app/Repositories/AdminRepositories/`, `/app/Repositories/GuestRepositories/`, or `/app/Repositories/GuestRepositories/AuthAccessRepositories/`
- Abstract database/model interactions from business logic
- Handle all model queries and database operations
- One repository per model (e.g., FamilyRepository, ProfileRepository, UserRepository)
- Return models or collections, not raw queries
- Keep queries focused and testable
- Match service location: admin repos for admin services, guest for public services, AuthAccessRepositories for authenticated user services

Examples:
```php
// Admin: app/Repositories/AdminRepositories/UserRepository.php
use App\Models\User;

class UserRepository {
    public function all() { return User::all(); }
    public function find(int $id) { return User::findOrFail($id); }
    public function count() { return User::count(); }
    public function activeTodayCount() { return User::whereDate('last_seen', today())->count(); }
}

// Public Guest: app/Repositories/GuestRepositories/BlogRepository.php
use App\Models\BlogPost;

class BlogRepository {
    public function all() { return BlogPost::published()->get(); }
    public function find(int $id) { return BlogPost::findOrFail($id); }
}

// Authenticated User: app/Repositories/GuestRepositories/AuthAccessRepositories/ProfileRepository.php
use App\Models\UserProfile;

class ProfileRepository {
    public function findByUser(User $user) { return UserProfile::where('user_id', $user->id)->first(); }
    public function updateProfile(User $user, array $data) {
        $profile = $this->findByUser($user) ?? new UserProfile(['user_id' => $user->id]);
        $profile->update($data);
        return $profile;
    }
}
```

### Models
- Define relationships in Eloquent models
- Use accessors/mutators for attribute transformation
- Declare mass assignable `$fillable` for security
- User model exists and is extended for custom fields
- Keep model code minimal—business logic belongs in services

### Routes
- Web routes in `/routes/web.php` for page rendering organized by context
- Use route groups for middleware protection with clear separation

**Three Route Groups:**

1. **Admin Routes** - Protected by `auth:admin` guard
   ```php
   Route::middleware(['auth:admin'])->group(function () {
       Route::get('/admin/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
   });
   ```

2. **Public Guest Routes** - Protected by `guest` middleware (unauthenticated only)
   ```php
   Route::middleware(['web', 'guest'])->group(function () {
       Route::get('/', [HomeController::class, 'index'])->name('home');
       Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
   });
   ```

3. **Authenticated User Routes** - Protected by `auth` middleware (logged-in users)
   ```php
   Route::middleware(['web', 'auth'])->group(function () {
       Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
       Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
   });
   ```

### Database
- Migrations in `/database/migrations/` are version controlled
- Use factories in `/database/factories/` for test data
- Seeds in `/database/seeders/` for initial data
- Both user and admin tables should be migrated as needed

### Frontend Components
- **Admin pages** in `/resources/js/Pages/AdminPages/`
  - Used with AdminLayout
  - For routes protected by `auth:admin`

- **Public Guest pages** in `/resources/js/Pages/GuestPages/`
  - Used with GuestLayout
  - For routes protected by `guest` middleware (unauthenticated)

- **Authenticated User pages** in `/resources/js/Pages/GuestPages/AuthAccessPages/`
  - Used with GuestLayout or AuthLayout (if different)
  - For routes protected by `auth` middleware (logged-in users)

- **Reusable components** in `/resources/js/Components/`
  - Shared across all contexts
  - Always type props with TypeScript interfaces

- **Layouts** organize consistent structure
  - AdminLayout for admin pages
  - GuestLayout for both public and authenticated user pages

## Build & Deployment

**Local Development:**
```bash
./sail npm run dev                   # Vite dev server on port 5173 (watches file changes, HMR)
# Laravel server is running in container automatically
# Access app at http://localhost
```

**Production Build:**
```bash
./sail npm run build                 # Creates public/build/
./sail artisan migrate --force       # Run migrations on production
./sail artisan optimize              # Optimize autoloader and cache
```

**Assets:**
- Vite entry point: `resources/js/app.tsx`
- Build output: `public/build/` (gitignored, generated)
- Asset manifest: `public/build/manifest.json`
- Referenced in `resources/views/app.blade.php` via `@vite` helper
- Bootstrap CSS and JS imported directly in app.tsx

## Important Notes

### Environment Configuration
- Copy `.env.example` to `.env`
- Key variables: `APP_NAME=FamTree`, `DB_DATABASE=famtree`
- `DB_HOST=mysql` (Docker service name, not 127.0.0.1)
- `REDIS_HOST=redis` (Docker service name)
- `VITE_APP_NAME=FamTree` (matches APP_NAME)
- Vite listens on port 5173, Laravel on port 80 (in Docker)

### Docker with Laravel Sail
- `docker-compose up -d` starts all services in background
- Services run in isolated containers with volume mounts
- MySQL and Redis persist data in named Docker volumes
- `./sail` script provides convenient access to artisan and npm
- XDebug can be enabled via environment variables
- For first-time setup, ensure containers have built: `docker-compose build`

### Git Workflow
- Recent commits: Setup Docker, React, admin guard structure
- Keep commits atomic with clear messages
- Use conventional format: `feat:`, `fix:`, `refactor:`, `docs:`, etc.
- Feature branches from main for new work

### Common Issues & Troubleshooting
- **App not accessible at http://localhost**: Ensure `docker-compose up -d` completed and port 80 is free
- **MySQL connection fails**: Check `DB_HOST=mysql` in .env, not 127.0.0.1; allow 10-15 seconds for MySQL startup
- **Props not visible in React**: Verify data is passed in `Inertia::render()` and check HandleInertiaRequests.php
- **Login/Register form not submitting**: Ensure database migrations have run (`./sail artisan migrate`), check browser console for errors
- **Validation errors not showing**: Verify form request classes exist in `/app/Http/Requests/GuestRequests/`, check error object structure in onError callback
- **User not logged in after registration**: Verify `Auth::guard('web')->login($user)` in AuthController.register(), check session configuration
- **Flash messages not appearing**: Ensure `$page.props.flash` is accessed in layout, verify flash message keys match backend redirect messages
- **Vite HMR not working**: Verify Vite dev server running on port 5173 via `./sail npm run dev`
- **Assets fail to compile**: Run `./sail npm install` and `./sail npm run build`, check for TypeScript errors
- **Database migration errors**: Review migration syntax, test with `./sail artisan migrate:rollback` then migrate again
- **Type errors in React**: Ensure TypeScript interfaces match actual backend data structure

## Useful Commands Cheat Sheet

```bash
# Laravel Commands (via Sail)
./sail artisan make:model Post -mrc            # Create model with migration, factory, controller
./sail artisan make:migration create_posts_table  # Create migration
./sail artisan migrate                         # Run pending migrations
./sail artisan migrate:rollback                # Undo last migration batch
./sail artisan migrate:reset                   # Rollback all migrations
./sail artisan config:cache                    # Cache config (clear with config:clear)
./sail artisan route:list                      # Show all registered routes
./sail artisan tinker                          # Interactive PHP shell
./sail artisan db:seed                         # Run seeders
./sail artisan pint                            # Format PHP code with Pint

# Frontend Commands (via Sail)
./sail npm install                             # Install npm dependencies
./sail npm run dev                             # Start Vite dev server (port 5173)
./sail npm run build                           # Production build
./sail npm list                                # Show installed packages

# Testing
./sail artisan test                            # Run all tests
./sail artisan test tests/Feature/ExampleTest.php  # Run specific test file
./sail artisan test --filter=testName         # Run tests matching filter

# Docker Management
docker-compose up -d                           # Start all services
docker-compose down                            # Stop all services (keep volumes)
docker-compose down -v                         # Stop & remove all volumes
docker-compose ps                              # Show container status
docker-compose logs -f famtree                 # Stream app container logs
docker-compose exec -it famtree bash           # Enter container shell
docker-compose build --no-cache                # Rebuild containers

# Git Commands
git status                                     # Show changes
git log --oneline -10                          # Recent commits
git diff                                       # Show unstaged changes
git switch -c feature/name                     # Create and switch to new branch
```

## Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Inertia.js Documentation](https://inertiajs.com)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vitejs.dev)
