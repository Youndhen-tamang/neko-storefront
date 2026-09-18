const RESERVED = new Set(["www", "api", "admin", "app", "super-admin"]);

/**
 * Public hostname of the storefront in production, e.g. "yourdomain.com".
 * Tenants live on `{slug}.{STORE_HOST}`. Unset (or "localhost") in development.
 */
const STORE_HOST = (process.env.NEXT_PUBLIC_STORE_HOST || "").toLowerCase().trim();
const IS_PRODUCTION = process.env.NODE_ENV === "production";

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost");
}

function configuredStoreHost(): string {
  return STORE_HOST && !isLocalHost(STORE_HOST) ? STORE_HOST : "";
}

/**
 * Extract the tenant slug from a hostname.
 *
 * With NEXT_PUBLIC_STORE_HOST set, only `{slug}.{STORE_HOST}` matches, so a preview
 * URL like "app.vercel.app" never resolves to a tenant. Local `{slug}.localhost` always
 * works. Without a configured host, the first label of any 3-part hostname is used.
 */
export function agencySlugFromHost(host: string): string {
  const hostname = host.split(":")[0]?.toLowerCase().trim() || "";
  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") return "";

  const parts = hostname.split(".");
  if (parts.length >= 2 && parts[parts.length - 1] === "localhost") {
    const slug = parts[0];
    return RESERVED.has(slug) ? "" : slug;
  }

  const base = configuredStoreHost();
  if (base) {
    if (!hostname.endsWith(`.${base}`)) return "";
    const slug = hostname.slice(0, -(base.length + 1));
    if (!slug || slug.includes(".") || RESERVED.has(slug)) return "";
    return slug;
  }

  if (parts.length >= 3) {
    const slug = parts[0];
    return RESERVED.has(slug) ? "" : slug;
  }

  return "";
}

/** Strip the tenant label from a hostname such as "lumina.yourdomain.com". */
function baseDomainOf(hostname: string): string {
  const parts = hostname.split(".");
  return parts.length >= 3 ? parts.slice(1).join(".") : hostname;
}

/**
 * Absolute URL of a tenant's storefront.
 *
 * - Local development (any *.localhost or localhost host): `{slug}.localhost:{port}`.
 * - Production: `{slug}.{NEXT_PUBLIC_STORE_HOST}`, falling back to the current page's
 *   base domain when the variable is not set.
 */
export function storeUrlForSlug(slug: string, path = ""): string {
  const normalized = path.startsWith("/") || path === "" ? path : `/${path}`;

  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    const portPart = port ? `:${port}` : "";

    if (isLocalHost(hostname)) {
      return `${protocol}//${slug}.localhost${portPart}${normalized}`;
    }

    const base = configuredStoreHost() || baseDomainOf(hostname);
    return `${protocol}//${slug}.${base}${portPart}${normalized}`;
  }

  const base = configuredStoreHost();
  if (IS_PRODUCTION && base) {
    return `https://${slug}.${base}${normalized}`;
  }
  return `http://${slug}.localhost:3000${normalized}`;
}
