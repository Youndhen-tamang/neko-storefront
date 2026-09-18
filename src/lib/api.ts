import { agencySlugFromHost } from "@/lib/tenant";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type Branding = {
  name: string;
  slug: string;
  brandName: string;
  logoUrl: string | null;
  primaryColor: string;
  tagline: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  tags: string[] | string;
  images: string[] | string;
  price_cents: number;
  stock: number;
  status: "draft" | "published";
};

export type Order = {
  id: string;
  invoice_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  total_cents: number;
  created_at: string;
  items: { name: string; quantity: number; unit_price_cents: number; image_url?: string }[];
};

const TOKEN_KEY = "admin_token";

export function getAgencySlug(): string {
  if (typeof window === "undefined") return "";
  return agencySlugFromHost(window.location.host);
}

export function setAgencySlug(_slug: string) {
  // Tenant is the subdomain; kept for call-site compatibility.
}

export function getAdminToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean; slug?: string } = {}
): Promise<T> {
  const { auth, slug, headers, ...rest } = options;
  const agencySlug = slug || getAgencySlug();
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(rest.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(agencySlug ? { "X-Agency-Slug": agencySlug } : {}),
      ...(auth && getAdminToken() ? { Authorization: `Bearer ${getAdminToken()}` } : {}),
      ...headers,
    },
  });

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data as T;
}
