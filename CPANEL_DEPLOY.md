# cPanel Deployment

> **This guide has moved.** See the full documentation:

## → [docs/CPANEL_DEPLOYMENT.md](./docs/CPANEL_DEPLOYMENT.md)

Quick reference:

1. Set document root to `public/`
2. Configure `.env` (especially `VITE_SUPABASE_*` and `APP_URL`)
3. Run `composer install --no-dev`
4. Run `npm run build`
5. Set permissions: `chmod -R 775 storage bootstrap/cache`
6. Run `php artisan config:cache`

Full checklist, troubleshooting, and security notes are in the linked guide.

Other docs: [docs/README.md](./docs/README.md)
