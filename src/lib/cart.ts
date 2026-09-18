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

export const CART_OPEN_EVENT = "cart-open";

export function saveCart(slug: string, items: CartItem[]) {
  localStorage.setItem(key(slug), JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function openCartDrawer() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_OPEN_EVENT));
}

export function addToCart(
  slug: string,
  product: { id: string; name: string; price_cents: number; images: unknown; stock: number },
  quantity = 1
) {
  if (product.stock < 1) return;
  const qty = Math.max(1, Math.floor(quantity));
  const items = getCart(slug);
  const existing = items.find((item) => item.productId === product.id);
  const images = asStringArray(product.images);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + qty, product.stock);
    existing.stock = product.stock;
    existing.priceCents = product.price_cents;
    existing.name = product.name;
    if (images[0]) existing.image = images[0];
  } else {
    items.push({
      productId: product.id,
      name: product.name,
      priceCents: product.price_cents,
      image: images[0],
      quantity: Math.min(qty, product.stock),
      stock: product.stock,
    });
  }
  saveCart(slug, items);
  openCartDrawer();
}

export function setCartItemQuantity(slug: string, productId: string, quantity: number) {
  const nextQty = Math.floor(quantity);
  const next = getCart(slug)
    .map((item) => {
      if (item.productId !== productId) return item;
      return { ...item, quantity: Math.min(Math.max(nextQty, 0), item.stock) };
    })
    .filter((item) => item.quantity > 0);
  saveCart(slug, next);
  return next;
}

export function removeFromCart(slug: string, productId: string) {
  const next = getCart(slug).filter((item) => item.productId !== productId);
  saveCart(slug, next);
  return next;
}

export function cartCount(slug: string) {
  return getCart(slug).reduce((sum, item) => sum + item.quantity, 0);
}
