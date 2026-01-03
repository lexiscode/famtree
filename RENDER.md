RECOMMEND OPTION WHEN DEPLOYING ON RENDER (WITH NGINX)

# ---------- Base PHP + Node ----------
FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git curl zip unzip nano libzip-dev libpng-dev libonig-dev libxml2-dev \
    libpq-dev nginx nodejs npm supervisor \
    && docker-php-ext-install pdo pdo_mysql mbstring zip exif pcntl bcmath

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy app files
COPY . .

# Ensure Laravel directories exist and are writable
RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Install backend & frontend deps
RUN composer require doctrine/dbal
RUN composer install --no-dev --optimize-autoloader
RUN npm install
RUN npm run build

# Laravel optimizations + storage symlink
RUN php artisan optimize:clear \
    && php artisan storage:link || true

# Nginx config
RUN rm /etc/nginx/sites-enabled/default
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Supervisor to run Nginx + PHP-FPM together
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

# Run DB migrations and start services at runtime
CMD sh -c "php artisan migrate --force || true && \
           supervisord -c /etc/supervisor/conf.d/supervisord.conf"





............................................................................................................
ALTERNATIVE OPTION WITHOUT USING NGINX AT ALL ON RENDER




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


# Render exposes a runtime-assigned port in $PORT
EXPOSE $PORT

# Run at container startup (not during build)
CMD sh -c "php artisan storage:link || true && \
           php artisan migrate --force || true && \
           php artisan serve --host=0.0.0.0 --port=$PORT"
