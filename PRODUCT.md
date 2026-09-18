# Neko (working name)

Multi-tenant ecommerce. One Express API serves many shops; each shop lives on its own subdomain (`{slug}.localhost:3000` in development) with its own storefront and its own `/admin`. A separate super-admin app (port 3004) creates shops and assigns their first admin.

## Repos

| Repo | Role | Dev URL |
| --- | --- | --- |
| neko-backend | Express + Knex + PostgreSQL API | http://localhost:4000 |
| neko-storefront | Storefront, agency admin, and the root landing | http://{slug}.localhost:3000 |
| neko-superadmin | Super admin | http://localhost:3004 |

## Audiences

- **Shop owner (agency admin):** runs one shop from `/admin` on that shop's subdomain.
- **Super admin:** creates shops, assigns owners, sees orders across shops.
- **Shopper:** browses a shop's catalog, checks out with Stripe, receives an invoice email.

## What the product can truthfully claim (as of 2026-09-18)

- Tenant resolved per request from the `x-agency-slug` header or the host subdomain.
- Storefront branding (name, logo, tagline, primary color) from the shop's settings.
- Admin: products, orders, alerts, notifications, settings.
- Stripe Checkout sessions with a webhook that records the order and invoice number.
- Invoice emails over SMTP.
- Assistant chat that reads the shop's live products before replying (OpenRouter).
- Product listing drafted from an uploaded photo (Cloudinary + OpenRouter).

Not claimable: pricing, customer counts, uptime, self-service registration (deferred), anything not in the backend.

## Surfaces

- `/` on the bare host: the root landing (Persuade). Doors: open a shop by slug, admin sign-in at `/admin/login`, super admin link.
- `/` on a tenant subdomain: the shop (Operate for the shopper).
- `/admin/*` on a tenant subdomain: the shop owner's dashboard (Operate).

## Brand commitments

- Name "Neko" is provisional; the user will decide the final name later.
- Visual system inherited from the storefront: Fraunces display, Outfit body, cream ground, forest green primary. The landing may commit green to whole regions and close on deep ink-green.
- Spline is reserved for the landing hero and only when a scene URL is configured (`NEXT_PUBLIC_SPLINE_SCENE`).
