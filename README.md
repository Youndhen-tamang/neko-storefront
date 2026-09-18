# Storefront + agency admin

Next.js shop and `/admin` dashboard. Tenant is the subdomain, e.g. http://lumen.localhost:3000

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Point `NEXT_PUBLIC_API_URL` at the backend. Requires the API running on port 4000 by default.

- Shop: http://{slug}.localhost:3000
- Admin: http://{slug}.localhost:3000/admin
# neko-storefront
