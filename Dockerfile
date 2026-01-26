# Build stage
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
    nodejs \
    npm \
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

# Set working directory
WORKDIR /var/www/html

# Copy composer files first for better caching
COPY composer.json composer.lock ./

# Install PHP dependencies
# Use --no-scripts to skip post-autoload scripts (artisan not available yet)
# Use --ignore-platform-reqs to avoid PHP version conflicts during build
RUN composer install --optimize-autoloader --no-dev --no-interaction --prefer-dist --ignore-platform-reqs --no-scripts

# Copy package files for Node
COPY package.json package-lock.json ./

# Install Node dependencies
RUN npm ci || npm install

# Copy application files
COPY . .

# Run Laravel package discovery (requires artisan and app files)
RUN php artisan package:discover --ansi

# Build assets
RUN npm run build

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
