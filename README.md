# FamTree

A modern full-stack web application for managing family trees, built with Laravel 10, React 18, and Inertia.js.

## Tech Stack

- **Backend**: Laravel 10 with PHP 8.2
- **Frontend**: React 18 with TypeScript
- **Server-Side Rendering**: Inertia.js
- **Database**: MySQL 8.0
- **Cache/Queue**: Redis
- **Build Tool**: Vite
- **Styling**: Bootstrap 5 + React Bootstrap
- **Email Testing**: Mailpit
- **Containerization**: Docker with Laravel Sail

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd famtree
   ```

2. **Start Docker containers**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - App: http://localhost
   - PhpMyAdmin: http://localhost:8080
   - Mailpit (Email): http://localhost:8025

## Running Commands in Docker

### Using docker-compose directly

```bash
# Enter the application container
docker-compose exec -it famtree bash

# Run Laravel commands
docker-compose exec -it famtree php artisan migrate
docker-compose exec -it famtree php artisan tinker

# Run npm commands
docker-compose exec -it famtree npm run dev
docker-compose exec -it famtree npm run build

# Access MySQL
docker-compose exec -it mysql mysql -u root famtree

# Access Redis
docker-compose exec -it redis redis-cli
```

### Using the sail script

```bash
# Enter the container
./sail shell

# Run artisan commands
./sail artisan migrate
./sail art make:model Post -m

# Run npm commands
./sail npm run dev
./sail npm install

# Run tests
./sail test

# Format code with Pint
./sail pint

# View logs
./sail logs -f
```

## Development

### Start the development servers

```bash
# In one terminal, start Vite dev server
docker-compose exec -it famtree npm run dev

# In another terminal, Laravel is already running
# Access the app at http://localhost
```

### Key directories

- **Backend**: `/app` - Laravel controllers, models, middleware
- **Frontend**: `/resources/js` - React components, pages, layouts
- **Database**: `/database/migrations` - Database schema
- **Routes**: `/routes/web.php` - Web routes with Inertia pages
- **Config**: `/config` - Application configuration

## Database

### Run migrations
```bash
docker-compose exec -it famtree php artisan migrate
```

### Seed database
```bash
docker-compose exec -it famtree php artisan db:seed
```

### Access MySQL CLI
```bash
docker-compose exec -it mysql mysql -u root famtree
```

## Testing

### Run PHPUnit tests
```bash
docker-compose exec -it famtree php artisan test
```

### Run single test file
```bash
docker-compose exec -it famtree php artisan test tests/Feature/ExampleTest.php
```

## Code Style

### Format PHP code with Pint
```bash
./sail pint
```

### Format code in specific directory
```bash
./sail pint app/Http/Controllers
```

## Services

| Service | Port | Access |
|---------|------|--------|
| Laravel App | 80 | http://localhost |
| Vite Dev Server | 5173 | http://localhost:5173 |
| MySQL | 3306 | localhost:3306 |
| Redis | 6379 | localhost:6379 |
| PhpMyAdmin | 8080 | http://localhost:8080 |
| Mailpit (SMTP) | 1025 | localhost:1025 |
| Mailpit (Web UI) | 8025 | http://localhost:8025 |

## Docker Management

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Stop and remove all volumes
docker-compose down -v

# View container status
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Rebuild containers
docker-compose build --no-cache

# Enter specific service container
docker-compose exec -it [service-name] bash
# Examples:
docker-compose exec -it famtree bash      # App container
docker-compose exec -it mysql bash        # MySQL container
docker-compose exec -it redis redis-cli   # Redis CLI
```

## Environment Configuration

Copy `.env.example` to `.env` and update as needed:

```bash
cp .env.example .env
```

Key environment variables:
- `APP_NAME=FamTree`
- `APP_ENV=local` (use `production` in production)
- `DB_HOST=mysql` (Docker service name)
- `REDIS_HOST=redis` (Docker service name)

## Project Structure

```
famtree/
├── app/                      # Backend code
│   ├── Http/Controllers/     # Request handlers
│   ├── Models/               # Eloquent models
│   └── Providers/            # Service providers
├── resources/
│   ├── js/                   # React components
│   │   ├── Pages/            # Page components (one per route)
│   │   ├── Components/       # Reusable components
│   │   ├── Layouts/          # Layout wrappers
│   │   └── app.tsx           # React entry point
│   ├── css/                  # Global styles
│   └── views/app.blade.php   # Root HTML template
├── routes/
│   ├── web.php               # Web routes
│   └── api.php               # API routes
├── database/
│   ├── migrations/           # Database schema
│   ├── factories/            # Model factories for testing
│   └── seeders/              # Database seeders
├── docker-compose.yml        # Docker services configuration
├── sail                      # Sail CLI script
└── vite.config.ts            # Vite configuration
```

## Creating New Features

### Create a Model with Migration and Controller
```bash
docker-compose exec -it famtree php artisan make:model FamilyMember -mrc
```

### Create an Inertia Page
1. Create controller method that returns `Inertia::render('PageName', $data)`
2. Create React component in `/resources/js/Pages/PageName.tsx`
3. Add route to `/routes/web.php`

Example:
```php
// In controller
return Inertia::render('FamilyMembers/Index', [
    'members' => $members,
]);

// In React component
export default function Index({ members }) {
    return (
        <GuestLayout>
            {members.map(member => (
                <div key={member.id}>{member.name}</div>
            ))}
        </GuestLayout>
    );
}
```

## Troubleshooting

### MySQL connection fails
- Ensure MySQL container is running: `docker-compose ps`
- Check `.env` has `DB_HOST=mysql` (not 127.0.0.1)
- Wait a few seconds for MySQL to fully start
- Check logs: `docker-compose logs mysql`

### Vite HMR not working
- Ensure Vite is running on port 5173
- Check `vite.config.ts` configuration

### Asset build fails
- Clear cache: `docker-compose exec -it famtree npm run build`
- Reinstall dependencies: `docker-compose exec -it famtree npm install`

### Database migration errors
- Check migration syntax
- Rollback and retry: `docker-compose exec -it famtree php artisan migrate:rollback`

## License

This project is open-sourced software licensed under the MIT license.

## Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Inertia.js Documentation](https://inertiajs.com)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [Laravel Sail Documentation](https://laravel.com/docs/sail)


Here's what you need — two steps:

  Step 1: Set the election deadline to the past

  UPDATE group_elections
  SET ends_at = NOW()
  WHERE status = 'active'
  AND class_set_id = (SELECT id FROM class_sets WHERE name LIKE '%Class of 2026 (English)%' LIMIT 1);

  Or if you want to target it more directly:

  -- Check the active election first
  SELECT * FROM group_elections WHERE status = 'active';

  -- Then update by ID (replace 1 with your election's ID)
  UPDATE group_elections SET ends_at = NOW() WHERE id = 1;

  Step 2: Run the processor command

  docker-compose exec -T famtree php artisan groups:process-elections
