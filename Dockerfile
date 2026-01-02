# ---------- Build Stage (PHP + Node for assets) ----------
FROM php:8.2-fpm AS build

# System deps
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpq-dev libonig-dev libxml2-dev \
    libzip-dev libpng-dev libjpeg62-turbo-dev \
    libfreetype6-dev libjpeg-dev libpng-dev \
    nodejs npm

# PHP extensions
RUN docker-php-ext-install pdo pdo_mysql mbstring zip exif pcntl bcmath

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-dev --optimize-autoloader
RUN npm install
RUN npm run build
RUN php artisan optimize:clear

# ---------- Runtime Stage ----------
FROM nginx:alpine

COPY --from=build /app /var/www/html
WORKDIR /var/www/html

# Nginx config
RUN rm /etc/nginx/conf.d/default.conf
COPY ./deploy/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
