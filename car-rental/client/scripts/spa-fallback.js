// Static hosts answer unknown URLs (like /cars or /bookings on refresh) with "Not Found".
// Serving the app's own index.html as 404.html lets the router handle those URLs instead.
import { copyFileSync } from 'node:fs';

copyFileSync('dist/index.html', 'dist/404.html');
console.log('Created dist/404.html (single-page-app fallback)');
