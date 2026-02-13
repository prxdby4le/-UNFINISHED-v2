# Node stage - build assets (Debian/glibc for Vite/Rollup/Tailwind native binaries)
FROM node:22-slim AS node-build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit

COPY . .

# Create vendor stub so Tailwind @source doesn't fail on missing path
RUN mkdir -p vendor/laravel/framework/src/Illuminate/Pagination/resources/views

# Build assets - log to file then cat so BuildKit shows the output
ENV NODE_OPTIONS=--max-old-space-size=1024
RUN node --version && npm --version
RUN npm run build > /tmp/build.log 2>&1; \
    BUILD_RC=$?; \
    cat /tmp/build.log; \
    exit $BUILD_RC

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
