# ---------- Base PHP + Node ----------
FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git curl zip unzip libzip-dev libpng-dev libonig-dev libxml2-dev \
    nodejs npm \
    && docker-php-ext-install pdo pdo_mysql mbstring zip exif bcmath

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy app files
COPY . .

# Ensure Laravel directories exist and are writable
RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Install backend dependencies
RUN composer install --no-dev --optimize-autoloader

# Build frontend (Inertia / React)
RUN npm install
RUN npm run build

# Clear caches to avoid stale config
RUN php artisan config:clear \
 && php artisan route:clear \
 && php artisan view:clear \
 && php artisan cache:clear

# Run migrations on first deploy (safe for staging)
RUN php artisan migrate --force || true

# Render exposes a runtime-assigned port in $PORT
EXPOSE $PORT

# Start Laravel server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=${PORT}"]
