import { agencySlugFromHost } from "@/lib/tenant";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_API_URL) {
  console.error("NEXT_PUBLIC_API_URL is not set; the storefront is calling http://localhost:4000 in production.");
}

export type Branding = {
  name: string;
  slug: string;
  brandName: string;
  logoUrl: string | null;
  primaryColor: string;
  tagline: string | null;
  landingTemplate: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export type Product = {
  id: string;
  agency_id?: string;
  agency_name?: string;
  agency_slug?: string;
  name: string;
  description: string | null;
  category: string | null;
  tags: string[] | string;
  images: string[] | string;
  price_cents: number;
  stock: number;
  low_stock_threshold?: number;
  status: "draft" | "published";
  like_count?: number;
  comment_count?: number;
};

export type ProductComment = {
  id: string;
  parent_id: string | null;
  author_name: string;
  body: string;
  created_at: string;
  invoice_number?: string;
  session_id?: string;
  product_id?: string;
  product_name?: string;
  agency_id?: string;
  agency_name?: string;
  agency_slug?: string;
  replies: ProductComment[];
};

export type TryOnSession = {
  id: string;
  resultUrl: string;
  sizeHint: string;
  product: Pick<Product, "id" | "name" | "price_cents" | "images" | "stock">;
};

export type ProductEngagement = {
  likeCount: number;
  commentCount: number;
  liked: boolean;
  remainingComments: number;
  comments: ProductComment[];
  productId?: string;
  productName?: string;
};

export type Analytics = {
  range: { from: string; to: string };
  summary: {
    orderCount: number;
    paidOrderCount: number;
    revenueCents: number;
    unitsSold: number;
    avgOrderCents: number;
  };
  inventory: {
    total: number;
    published: number;
    draft: number;
    lowStock: number;
    categories: string[];
  };
  revenueByDay: { date: string; orderCount: number; revenueCents: number }[];
  ordersByStatus: { status: string; count: number; revenueCents: number }[];
  topProducts: { productId: string | null; name: string; quantity: number; revenueCents: number }[];
  byCategory: { category: string; quantity: number; revenueCents: number }[];
  byAgency: { agencyId: string; name: string; slug: string; orderCount: number; revenueCents: number }[];
};

export type Order = {
  id: string;
  invoice_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  shipping_address?: string | null;
  subtotal_cents?: number;
  total_cents: number;
  currency?: string;
  email_sent?: boolean;
  payment_method?: string;
  read?: boolean;
  created_at: string;
  items: {
    name: string;
    quantity: number;
    unit_price_cents: number;
    image_url?: string;
    product_id?: string | null;
  }[];
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
  options: RequestInit & { auth?: boolean; slug?: string; sessionId?: string } = {}
): Promise<T> {
  const { auth, slug, sessionId, headers, ...rest } = options;
  const agencySlug = slug || getAgencySlug();
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(rest.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(agencySlug ? { "X-Agency-Slug": agencySlug } : {}),
      ...(sessionId ? { "X-Session-Id": sessionId } : {}),
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
