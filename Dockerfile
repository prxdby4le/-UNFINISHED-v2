# Stage: generate Wayfinder routes (PHP) - needed for Vite build
FROM php:8.4-cli-alpine AS wayfinder
RUN apk add --no-cache git unzip postgresql-dev oniguruma-dev libxml2-dev
# json e tokenizer já vêm no PHP 8.4; instalá-los via ext-install quebra o build
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring fileinfo pcntl xml ctype
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --ignore-platform-reqs --no-scripts
COPY . .
# Wayfinder needs Laravel bootstrapped (APP_KEY required)
ENV APP_KEY=base64:dGVzdC1rZXktZm9yLWJ1aWxkLW9ubHk=
# Generate route helpers (required by frontend; no PHP at node-build stage)
RUN php artisan wayfinder:generate --with-form

# Node stage - build assets
FROM node:22-slim AS node-build
WORKDIR /app

ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN npm ci --no-audit

COPY . .
# Use Wayfinder-generated routes (no PHP in node stage)
COPY --from=wayfinder /app/resources/js/routes ./resources/js/routes
COPY --from=wayfinder /app/resources/js/wayfinder ./resources/js/wayfinder
COPY --from=wayfinder /app/resources/js/actions ./resources/js/actions

RUN mkdir -p vendor/laravel/framework/src/Illuminate/Pagination/resources/views

ENV NODE_OPTIONS=--max-old-space-size=1024
ENV NODE_ENV=production
RUN npm run build

# Base PHP stage
FROM php:8.4-fpm-alpine AS base

LABEL maintainer="Trashtalk Records"
LABEL description="Trashtalk Records - Laravel + React Application"
LABEL version="1.0"

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    oniguruma-dev \
    postgresql-dev \
    nginx \
    supervisor

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy composer files first for better caching
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-dev --no-interaction --prefer-dist --ignore-platform-reqs --no-scripts

# Copy application files
COPY . .

# Copy built assets from node stage
COPY --from=node-build /app/public/build /var/www/html/public/build

# Run Laravel package discovery
RUN php artisan package:discover --ansi

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Production stage
FROM base AS production

LABEL com.trashtalk.project="trashtalk-records"
LABEL com.trashtalk.environment="production"

# Copy nginx configuration
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf

# Copy supervisor configuration
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose port
EXPOSE 80

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
