"use client";

import { asStringArray } from "@/lib/utils";

export type CartItem = {
  productId: string;
  name: string;
  priceCents: number;
  image?: string;
  quantity: number;
  stock: number;
};

function key(slug: string) {
  return `cart:${slug}`;
}

export function getCart(slug: string): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key(slug)) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(slug: string, items: CartItem[]) {
  localStorage.setItem(key(slug), JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(
  slug: string,
  product: { id: string; name: string; price_cents: number; images: unknown; stock: number }
) {
  const items = getCart(slug);
  const existing = items.find((item) => item.productId === product.id);
  const images = asStringArray(product.images);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + 1, product.stock);
  } else {
    items.push({
      productId: product.id,
      name: product.name,
      priceCents: product.price_cents,
      image: images[0],
      quantity: 1,
      stock: product.stock,
    });
  }
  saveCart(slug, items);
}

export function cartCount(slug: string) {
  return getCart(slug).reduce((sum, item) => sum + item.quantity, 0);
}
