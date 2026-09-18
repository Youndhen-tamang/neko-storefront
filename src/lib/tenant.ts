const RESERVED = new Set(["www", "api", "admin", "app", "super-admin"]);

export function agencySlugFromHost(host: string): string {
  const hostname = host.split(":")[0]?.toLowerCase().trim() || "";
  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") return "";

  const parts = hostname.split(".");
  if (parts.length >= 2 && parts[parts.length - 1] === "localhost") {
    const slug = parts[0];
    return RESERVED.has(slug) ? "" : slug;
  }

  if (parts.length >= 3) {
    const slug = parts[0];
    return RESERVED.has(slug) ? "" : slug;
  }

  return "";
}

export function storeUrlForSlug(slug: string, path = ""): string {
  const normalized = path.startsWith("/") || path === "" ? path : `/${path}`;
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : "";
    return `${protocol}//${slug}.localhost${port}${normalized}`;
  }
  return `http://${slug}.localhost:3000${normalized}`;
}
