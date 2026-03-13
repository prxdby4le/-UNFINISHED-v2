#!/bin/sh

echo "[entrypoint] Starting initialization..."

cd /var/www/html

# Ensure storage directories exist and are writable
mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views storage/app/public
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

# Create storage symlink if missing
if [ ! -L public/storage ]; then
    ln -sf /var/www/html/storage/app/public /var/www/html/public/storage
    echo "[entrypoint] Storage symlink created"
fi

# Clear stale caches first, then rebuild
php artisan config:clear 2>&1 || true
php artisan route:clear 2>&1 || true
php artisan view:clear 2>&1 || true

php artisan config:cache 2>&1 || echo "[entrypoint] WARNING: config:cache failed, continuing..."
php artisan route:cache 2>&1 || echo "[entrypoint] WARNING: route:cache failed, continuing..."
php artisan view:cache 2>&1 || echo "[entrypoint] WARNING: view:cache failed, continuing..."
echo "[entrypoint] Caches warmed"

# Run migrations (non-fatal)
php artisan migrate --force --no-interaction 2>&1 || echo "[entrypoint] WARNING: Migration failed, continuing..."
echo "[entrypoint] Migrations checked"

echo "[entrypoint] Initialization complete, starting services..."

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
