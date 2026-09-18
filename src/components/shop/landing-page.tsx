"use client";

import { Branding, Product } from "@/lib/api";
import { AtelierLanding } from "@/components/shop/templates/atelier-landing";
import { BoutiqueLanding } from "@/components/shop/templates/boutique-landing";
import { MarketplaceLanding } from "@/components/shop/templates/marketplace-landing";
import { useShop } from "@/components/shop/shop-context";

export function LandingPage({
  products,
  loading,
  branding: brandingProp,
}: {
  products: Product[];
  loading: boolean;
  branding?: Branding | null;
}) {
  const shop = useShop();
  const branding = brandingProp ?? shop.branding;
  const template = shop.template;
  const props = { products, loading, branding };

  if (template === "boutique") return <BoutiqueLanding {...props} />;
  if (template === "marketplace") return <MarketplaceLanding {...props} />;
  return <AtelierLanding {...props} />;
}
