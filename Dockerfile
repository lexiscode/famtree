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

# Install backend & frontend deps
RUN composer install --no-dev --optimize-autoloader
RUN npm install
RUN npm run build

# Laravel optimizations
RUN php artisan optimize:clear

# Nginx config
RUN rm /etc/nginx/sites-enabled/default
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Supervisor to run Nginx + PHP-FPM together
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

RUN php artisan migrate --force || true

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
