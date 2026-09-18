"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ShopShell } from "@/components/shop/shop-shell";
import { LandingPage } from "@/components/shop/landing-page";
import { Product, api, getAgencySlug } from "@/lib/api";
import { parseLandingTemplate } from "@/lib/templates";

function HomePageInner() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const previewTemplate = parseLandingTemplate(searchParams.get("preview"));

  useEffect(() => {
    if (!getAgencySlug()) return;
    api<{ products: Product[] }>("/api/products/public")
      .then((data) => setProducts(data.products))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ShopShell flush templateOverride={previewTemplate || undefined}>
      <LandingPage products={products} loading={loading} />
    </ShopShell>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<p className="p-10 text-muted-foreground">Loading storefront...</p>}>
      <HomePageInner />
    </Suspense>
  );
}
