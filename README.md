# VocaCommerce storefront

Next.js app for [VocaCommerce](https://strapnote.com): the public landing, tenant shops, and shop-owner admin.

Each shop lives on its own subdomain (`{slug}.localhost:3000` in development) with its own catalog, checkout, voice assistant, and `/admin`. The bare host is the product landing.

## Stack

- [Next.js](https://nextjs.org/) 15 (App Router) and React 19
- TypeScript
- Tailwind CSS and Radix UI
- Talks to the Express API (`neko-backend`) over `NEXT_PUBLIC_API_URL`

## Related repos

| Repo | Role | Dev URL |
| --- | --- | --- |
| `neko-backend` | Express + Knex + PostgreSQL API | http://localhost:4000 |
| `neko-storefront` (this repo) | Landing, tenant storefront, agency admin | http://{slug}.localhost:3000 |
| `neko-superadmin` | Creates shops and assigns the first owner | http://localhost:3004 |

## Setup

You need Node.js 20+ and the API running (port 4000 by default).

```bash
cp .env.example .env.local
npm install
npm run dev
```

The app starts at [http://localhost:3000](http://localhost:3000).

### Local URLs

| Surface | URL |
| --- | --- |
| Product landing | http://localhost:3000 |
| Shop | http://{slug}.localhost:3000 |
| Shop admin | http://{slug}.localhost:3000/admin |
| Super admin (separate app) | http://localhost:3004 |

macOS and most browsers resolve `*.localhost` without extra hosts-file entries.

## Environment

Copy `.env.example` to `.env.local`. Only these public variables are required:

| Variable | Development | Production |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | API origin, e.g. `https://api.example.com` |
| `NEXT_PUBLIC_SUPER_ADMIN_URL` | `http://localhost:3004` | Super-admin origin |
| `NEXT_PUBLIC_STORE_HOST` | leave empty | Apex domain with a wildcard DNS record, e.g. `strapnote.com` |

Leave `NEXT_PUBLIC_STORE_HOST` empty in development so shops are served on `{slug}.localhost:3000`. In production it must match the custom domain (wildcard `*.yourdomain.com`).

Optional: `NEXT_PUBLIC_SPLINE_SCENE` for a Spline scene in the landing hero. If unset, a live storefront preview fills that slot.

## What this app covers

- **Landing** on the bare host: product story, store request, terms and privacy
- **Shopper storefront** on a tenant subdomain: catalog, product pages, cart, Stripe / eSewa / cash-on-delivery checkout, voice shopping, chat
- **Shop admin** at `/admin` on that same subdomain: products (including photo-drafted listings), orders, alerts, comments, notifications, analytics, and settings

Tenant is resolved from the host subdomain (or the `x-agency-slug` header the middleware sets). Branding (name, logo, tagline, color) comes from the shop's settings on the API.

## Scripts

```bash
npm run dev     # next dev on port 3000
npm run build   # production build
npm run start   # next start on port 3000
```

## License

MIT. See [LICENSE](LICENSE).
