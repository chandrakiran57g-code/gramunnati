# cPanel Deployment — cmsr.in

| Item | Value |
|------|--------|
| Domain | `https://cmsr.in` |
| Server path | `/home/cmsr/cmsr` |
| Document root | `/home/cmsr/cmsr/public` |
| Git repo | `https://github.com/chandrakiran57g-code/cmsr.git` |

> **No Node.js on cPanel.** Build on your PC (`npm run build`), upload `public/build/`.

## Deploy steps

1. Clone (done): `cd ~/cmsr && git clone https://github.com/chandrakiran57g-code/cmsr.git .`
2. Copy `.env` from `env.cmsr.in.example` (fill password) or upload your local `.env`
3. `composer install --optimize-autoloader --no-dev`
4. `php artisan key:generate` (if `APP_KEY` empty)
5. `php artisan gramunnati:mark-migrations-run` (if DB already imported) **or** `php artisan migrate --force` (empty DB)
6. `php artisan storage:link`
7. `chmod -R 775 storage bootstrap/cache`
8. `php artisan config:cache`
9. Set document root → `/home/cmsr/cmsr/public`

Full guide: [docs/DEPLOYMENT_STATUS.md](./docs/DEPLOYMENT_STATUS.md)
