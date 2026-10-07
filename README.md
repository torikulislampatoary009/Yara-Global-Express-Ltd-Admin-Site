# Yara Global Express Admin

Static admin frontend designed for GitHub Pages and the YGE Node API.

## Included
Dashboard, shipments/tracking, customers, quote requests, accounting, rate cards, reports, users/staff and settings.

## Important
The browser cannot securely prevent someone from opening a static HTML file hosted on GitHub Pages by URL. Security is enforced by the backend APIs and the frontend session guard. Never rely on hidden HTML pages for authorization.

Change the API base URL in `js/core.js` and `js/login.js` if the Render backend URL changes.
