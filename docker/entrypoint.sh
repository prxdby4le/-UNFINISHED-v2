#!/bin/sh
set -e

echo "[entrypoint] Starting initialization..."

cd /var/www/html

# Ensure storage directories exist and are writable
mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views storage/app/public
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Create storage symlink if missing
if [ ! -L public/storage ]; then
    ln -sf /var/www/html/storage/app/public /var/www/html/public/storage
    echo "[entrypoint] Storage symlink created"
fi

# Cache config and routes for performance
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "[entrypoint] Caches warmed"

# Run migrations (safe: --force skips confirmation in production)
php artisan migrate --force --no-interaction 2>&1 || echo "[entrypoint] WARNING: Migration failed, continuing..."
echo "[entrypoint] Migrations checked"

echo "[entrypoint] Initialization complete, starting services..."

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
