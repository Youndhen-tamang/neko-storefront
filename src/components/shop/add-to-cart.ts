"use client";

import { Product, getAgencySlug } from "@/lib/api";
import { addToCart } from "@/lib/cart";

export function addProductToCart(product: Product) {
  addToCart(getAgencySlug(), product);
}
