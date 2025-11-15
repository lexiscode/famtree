# Laravel Task Scheduler Setup

This application uses Laravel's built-in task scheduler to automatically delete expired user accounts.

## Scheduled Tasks

### Delete Expired Accounts
- **Command**: `accounts:delete-expired --force`
- **Frequency**: Daily at 2:00 AM
- **Purpose**: Permanently deletes user accounts that were soft-deleted 30+ days ago
- **Configuration**: `app/Console/Kernel.php`

## Setup Instructions

### Development Environment

In development, you can manually run the scheduler to test:

```bash
# Run the delete expired accounts command manually
php artisan accounts:delete-expired

# Or with force flag to skip confirmation
php artisan accounts:delete-expired --force

# Check scheduled tasks
php artisan schedule:list
```

### Production Environment (Docker/Sail)

For the scheduler to work in production, you need to set up a cron job that runs Laravel's scheduler every minute:

#### Option 1: Using Docker Cron Container (Recommended)

Add a cron service to your `docker-compose.yml`:

```yaml
cron:
  image: mcuadros/ofelia:latest
  depends_on:
    - famtree
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
  command: daemon --docker
  environment:
    - SWARM_MODE=false
  labels:
    ofelia: "enabled"
    ofelia-job-exec-schedule: "@daily"
    ofelia-job-exec-command: "php artisan schedule:run"
```

#### Option 2: Using Linux Crontab

Add this line to your server's crontab (`crontab -e`):

```cron
* * * * * cd /var/www/html && php artisan schedule:run >> /dev/null 2>&1
```

This runs the scheduler every minute, which then executes scheduled tasks based on their frequency.

#### Option 3: Using supervisor (for continuous running)

Create a supervisor configuration file at `/etc/supervisor/conf.d/laravel-scheduler.conf`:

```ini
[program:laravel-scheduler]
process_name=%(program_name)s
command=php /var/www/html/artisan schedule:work
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/laravel-scheduler.log
```

Then reload supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-scheduler
```

## How It Works

1. **User Deletes Account**
   - Account is soft deleted (marked with `deleted_at` timestamp)
   - `scheduled_deletion_at` is set to 30 days from now
   - User is logged out

2. **Daily Check (2:00 AM)**
   - Scheduler runs the `accounts:delete-expired` command
   - Command finds all soft-deleted accounts where `scheduled_deletion_at <= now()`
   - Those accounts are permanently deleted using `forceDelete()`

3. **Account Recovery**
   - If user logs back in within 30 days, account is automatically restored
   - `scheduled_deletion_at` timestamp is cleared
   - User can continue using the account as normal

## Monitoring

To check if the scheduler is running:

```bash
# List all scheduled tasks
php artisan schedule:list

# Check schedule history (if logging is enabled)
tail -f /var/log/laravel-scheduler.log
```

## Troubleshooting

### Scheduler Not Running

If scheduled tasks aren't executing:

1. **Verify cron is set up**: Check that the cron job or scheduler process is actually running
2. **Check logs**: Look for errors in Laravel's log files
3. **Test manually**: Run `php artisan schedule:run` to test
4. **Check timezone**: Ensure your server timezone matches APP_TIMEZONE in `.env`

### Tasks Running at Wrong Time

- Check `app/Console/Kernel.php` for schedule definitions
- Verify server timezone: `date` and `timedatectl` commands
- Check if `APP_TIMEZONE` is set correctly in `.env`

## Important Notes

- The scheduler uses `->onOneServer()` to ensure it only runs once in distributed environments
- The `->withoutOverlapping()` prevents multiple instances from running simultaneously
- The `--force` flag automatically confirms deletion without prompting
- All deletions are permanent and cannot be undone
