import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STORE_CURRENCY = "NPR";

export function resolveCurrency(currency?: string | null) {
  const code = (currency || STORE_CURRENCY).toUpperCase();
  return code === "USD" ? STORE_CURRENCY : code;
}

export function money(cents: number, currency = STORE_CURRENCY) {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: resolveCurrency(currency),
  }).format((cents || 0) / 100);
}

export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function paymentMethodLabel(method?: string | null) {
  if (method === "cod") return "Cash on delivery";
  if (method === "esewa") return "eSewa";
  return "Stripe";
}
