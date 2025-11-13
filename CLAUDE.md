# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FamTree is a Laravel 10 + React 18 + Inertia.js full-stack web application for managing family trees. The project follows a modern monolithic architecture with a clear separation between backend (PHP/Laravel) and frontend (React/TypeScript).

The application uses **Laravel Sail** (Docker-based) for local development, with separate directory structures for guest and admin features. The codebase is organized into AdminPages/AdminControllers and GuestPages/GuestControllers to keep concerns isolated.

## Quick Start

### Essential Commands

**Using Laravel Sail (Recommended):**
```bash
./sail artisan serve                 # Start Laravel dev server (built-in with Sail)
./sail artisan migrate               # Run database migrations
./sail artisan db:seed               # Seed database
./sail artisan make:model Model -mrc # Create model with migration, factory, controller
./sail artisan test                  # Run PHPUnit tests
./sail artisan test tests/Feature/ExampleTest.php  # Run single test file
./sail pint                          # Format code with PHP linting (Laravel Pint)
./sail npm run dev                   # Start Vite dev server (port 5173)
./sail npm run build                 # Production build (outputs to public/build)
./sail shell                         # Enter the app container bash
```

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
- `/app/Http/Controllers/Controller.php` - Base controller class
- `/app/Models/` - Eloquent models
- `/app/Http/Middleware/` - Request/response middleware (HandleInertiaRequests.php for props sharing)
- `/app/Actions/AdminServices/` - Admin business logic and service classes
- `/app/Actions/GuestServices/` - Guest/public business logic and service classes
- `/app/Repositories/AdminRepositories/` - Data access layer for admin features
- `/app/Repositories/GuestRepositories/` - Data access layer for guest features
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

**1. Choose the appropriate section (Admin or Guest):**
- Admin features: Use AdminControllers, AdminServices, AdminRepositories, and AdminPages
- Guest/Public features: Use GuestControllers, GuestServices, GuestRepositories, and GuestPages

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

## Code Organization Guidelines

### Controllers
- Organize into AdminControllers/ and GuestControllers/ directories
- Keep controllers focused on request/response handling only
- Inject repositories or services via constructor dependency injection
- Never access models or database directly—delegate to repositories/services
- Return `Inertia::render()` for page views with typed data from services
- For AdminPages: `Inertia::render('AdminPages/...')`
- For GuestPages: `Inertia::render('GuestPages/...')`

Example:
```php
// app/Http/Controllers/AdminControllers/FamilyController.php
use App\Actions\AdminServices\FamilyService;

class FamilyController
{
    public function __construct(private FamilyService $familyService) {}

    public function index()
    {
        $members = $this->familyService->getAllMembers();
        return Inertia::render('AdminPages/Family/Index', ['members' => $members]);
    }
}
```

### Services (Business Logic)
- Located in `/app/Actions/AdminServices/` or `/app/Actions/GuestServices/`
- Contain all business logic, calculations, and data processing
- Inject repositories via constructor to access data
- Should be stateless and reusable
- One service per feature/entity (e.g., FamilyService, UserService)
- Handle complex operations and data transformations
- Can call other services if needed

Example:
```php
// app/Actions/AdminServices/FamilyService.php
use App\Repositories\AdminRepositories\FamilyRepository;

class FamilyService
{
    public function __construct(private FamilyRepository $familyRepo) {}

    public function getAllMembers()
    {
        $members = $this->familyRepo->all();
        return $members->sortBy('name')->values();
    }

    public function createMember(array $data)
    {
        // Business logic and validation
        return $this->familyRepo->create($data);
    }
}
```

### Repositories (Data Access)
- Located in `/app/Repositories/AdminRepositories/` or `/app/Repositories/GuestRepositories/`
- Abstract database/model interactions from business logic
- Handle all model queries and database operations
- One repository per model (e.g., FamilyRepository, UserRepository)
- Return models or collections, not raw queries
- Keep queries focused and testable

Example:
```php
// app/Repositories/AdminRepositories/FamilyRepository.php
use App\Models\Family;

class FamilyRepository
{
    public function all()
    {
        return Family::all();
    }

    public function find(int $id)
    {
        return Family::findOrFail($id);
    }

    public function create(array $data)
    {
        return Family::create($data);
    }

    public function update(int $id, array $data)
    {
        $family = $this->find($id);
        $family->update($data);
        return $family;
    }

    public function delete(int $id)
    {
        return $this->find($id)->delete();
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
- Web routes in `/routes/web.php` for page rendering
- Use route groups for middleware protection (auth, admin guards)
- Separate admin routes (require admin guard) from guest routes
- Example: `Route::middleware(['auth:admin'])->group(...)`

### Database
- Migrations in `/database/migrations/` are version controlled
- Use factories in `/database/factories/` for test data
- Seeds in `/database/seeders/` for initial data
- Both user and admin tables should be migrated as needed

### Frontend Components
- Admin pages in `/resources/js/Pages/AdminPages/`
- Guest pages in `/resources/js/Pages/GuestPages/`
- Reusable components in `/resources/js/Components/`
- Always type props with TypeScript interfaces
- AdminLayout and GuestLayout provide consistent structure

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
