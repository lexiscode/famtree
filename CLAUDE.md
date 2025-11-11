# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FamTree is a Laravel 10 + React 18 + Inertia.js full-stack web application for managing family trees. The project follows a modern monolithic architecture with a clear separation between backend (PHP/Laravel) and frontend (React/TypeScript).

## Quick Start

### Essential Commands

**Backend (Laravel):**
```bash
php artisan serve                    # Start Laravel dev server (port 8000)
php artisan tinker                   # Interactive PHP shell
php artisan migrate                  # Run database migrations
php artisan db:seed                  # Seed database
php artisan make:model Model -mrc    # Create model with migration, factory, controller
php artisan make:controller ResourceController --resource
php artisan test                     # Run PHPUnit tests
php artisan test tests/Unit/Example  # Run single test file
php artisan pint                     # Format code with PHP linting
php artisan queue:work               # Process queued jobs
```

**Frontend (React/Vite):**
```bash
npm run dev                          # Start Vite dev server (port 5173)
npm run build                        # Production build (outputs to public/build)
npm test                             # Run tests (if configured)
```

**Database & Docker:**
```bash
docker-compose up -d                 # Start all services
docker-compose down                  # Stop all services
docker-compose exec mysql mysql -u root -p famtree  # Direct MySQL access
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
- `/app/Http/Controllers/` - Request handlers
- `/app/Models/` - Eloquent models
- `/app/Http/Middleware/` - Request/response middleware
- `/app/Providers/` - Service registration and bootstrapping
- `/routes/` - Route definitions (web.php, api.php)
- `/database/migrations/` - Database schema changes
- `/config/` - Application configuration

**Inertia Middleware** (`app/Http/Middleware/HandleInertiaRequests.php`):
- Integrates server-side rendering of React components
- Shares authentication state, user info, and flash messages
- All data passed here is available to frontend components via `$page.props`

**Authentication:**
- Uses Laravel Sanctum for API token authentication
- User model includes password hashing via casts
- Admin guard available (configure in `/config/auth.php`)
- Session-based auth for web routes

**Database:**
- MySQL 8.0 with migrations in `/database/migrations/`
- Users table is the primary model (created by default)
- Migrations run with `php artisan migrate`

### Frontend Structure (React/TypeScript)

**Key Directories:**
- `/resources/js/Pages/` - Page components (one per route)
- `/resources/js/Layouts/` - Layout wrappers (GuestLayout available)
- `/resources/js/Components/` - Reusable components
- `/resources/js/types/` - TypeScript type definitions
- `/resources/css/` - Global styles
- `/resources/views/app.blade.php` - Root HTML template

**Entry Point** (`resources/js/app.tsx`):
- Initializes React with Inertia.js adapter
- Auto-resolves pages from `/Pages/**/*.tsx`
- Bootstrap CSS/JS and Google Fonts loaded via CDN
- Vite handles HMR (hot module replacement)

**Type Safety:**
- Global types in `/resources/js/types/inertia.d.ts`:
  - `AuthUser` interface (id, name, email)
  - `CustomPageProps` extends Inertia PageProps with auth user
- TypeScript strict mode enabled in `tsconfig.json`
- Path aliases: `@/*` maps to `resources/js/*`

**Inertia.js Communication:**
- Pages receive props from Laravel backend via Inertia
- Use `usePage()` hook to access `$page.props`
- Properties shared in HandleInertiaRequests middleware are automatically typed

**UI Framework:**
- Bootstrap 5 (loaded via CDN + npm)
- React Bootstrap for component library
- Bootstrap Icons available
- Font Awesome available

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

**Real-Time Features (Ready but not enabled):**
- Broadcasting infrastructure available in `/config/broadcasting.php`
- Echo/Pusher setup commented in `resources/js/bootstrap.js`
- Channels defined in `/routes/channels.php`

**Payment Integration:**
- Paystack script loaded in root template
- Ready for e-commerce features

## Development Workflow

### Creating New Features

**1. Create Backend Models & Controllers:**
```bash
php artisan make:model FamilyMember -mrc  # Creates model, migration, factory, controller
# Edit migration in database/migrations/
php artisan migrate
```

**2. Create API Routes:**
```php
// routes/api.php or routes/web.php
Route::get('/family', [FamilyMemberController::class, 'index']);
```

**3. Create Frontend Pages:**
- Create component in `resources/js/Pages/FamilyMembers/Index.tsx`
- Receives props from backend via Inertia
- Can use layouts from `resources/js/Layouts/`

**4. Share Data with Frontend:**
```php
// In HandleInertiaRequests or controller
return Inertia::render('FamilyMembers/Index', [
    'members' => $members,
]);
```

### Testing

**PHPUnit (Backend):**
- Unit tests: `/tests/Unit/`
- Feature tests: `/tests/Feature/`
- Run: `php artisan test`
- Run single test: `php artisan test tests/Feature/ExampleTest.php`

**Test Helpers:**
- Faker for generating test data
- Mockery for mocking
- Laravel's testing traits in `/tests/TestCase.php`

## Inertia.js & Type Safety

### Component Props Pattern

```typescript
// resources/js/Pages/FamilyMembers/Index.tsx
import { useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Index({ members }) {
    const { props } = usePage();
    const { auth } = props; // Shared from HandleInertiaRequests

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

```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $request->user(),
        ],
        'flash' => [
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
        ],
    ]);
}
```

## Code Organization Guidelines

### Controllers
- Keep controllers focused on request/response handling
- Use dependency injection for services
- Return `Inertia::render()` for web pages, JSON for APIs

### Models
- Define relationships in Eloquent models
- Use accessors/mutators for attribute transformation
- Mass assignable `$fillable` for security

### Routes
- Web routes: `/routes/web.php` for page rendering
- API routes: `/routes/api.php` for data endpoints
- Use route groups for middleware and prefixes

### Database
- Migrations in `/database/migrations/` are version controlled
- Use factories for test data
- Seeds in `/database/seeders/` for initial data

### Frontend Components
- One page per route in `/resources/js/Pages/`
- Reusable components in `/resources/js/Components/`
- Use TypeScript types for props
- Layouts provide common structure (GuestLayout available)

## Build & Deployment

**Development:**
- Vite dev server: `npm run dev` (watches file changes, HMR)
- Laravel server: `php artisan serve` (or use Sail)
- Both must run simultaneously for full functionality

**Production Build:**
```bash
npm run build                        # Creates public/build/
php artisan migrate --force          # Run migrations on production
php artisan optimize                 # Optimize app
```

**Assets:**
- Vite entry: `resources/js/app.tsx`
- Output: `public/build/` (gitignored)
- Manifest: `public/build/manifest.json`
- Referenced in `resources/views/app.blade.php` via `@vite` helper

## Important Notes

### Environment Configuration
- Copy `.env.example` to `.env`
- Set `APP_NAME=FamTree`, `DB_DATABASE=famtree`
- Vite port default is 5173, Laravel port is 8000
- Change `VITE_APP_NAME` to match your app name

### Docker with Sail
- `docker-compose up -d` starts all services
- Services run in isolated containers with volume mounts
- MySQL and Redis persist data in named volumes
- XDebug can be enabled via environment variables

### Git Workflow
- Recent commits: Feature-based (setup react, laravel foundation)
- Keep commits atomic and descriptive
- Use conventional commit format: `feat:`, `fix:`, `refactor:`, etc.

### Common Pitfalls
- **Props not visible in React**: Check HandleInertiaRequests middleware
- **CSRF errors**: Ensure middleware is registered in Kernel
- **Asset compilation fails**: Run `npm install` and clear build cache
- **Database migration issues**: Check migration syntax and rollback with `migrate:rollback`
- **Type errors**: Ensure `tsconfig.json` path aliases match file structure

## Useful Commands Cheat Sheet

```bash
# Laravel Commands
php artisan make:model Post -a                 # Create with all resources
php artisan migrate:rollback                   # Undo last migration
php artisan queue:work                         # Process background jobs
php artisan config:cache                       # Cache config
php artisan route:list                         # Show all routes
php artisan tinker                             # Interactive shell

# Node/Vite Commands
npm install                                    # Install dependencies
npm run dev                                    # Dev server
npm run build                                  # Production build
npm list                                       # Show installed packages

# Docker Commands
docker-compose ps                              # Show running containers
docker-compose logs -f famtree                 # View app logs
docker-compose exec famtree bash               # Shell access
docker-compose down -v                         # Stop & remove volumes

# Git Commands
git status                                     # Show changes
git log --oneline -10                          # Recent commits
```

## Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Inertia.js Documentation](https://inertiajs.com)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vitejs.dev)
