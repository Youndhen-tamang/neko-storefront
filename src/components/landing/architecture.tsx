"use client";

import { TenantTree } from "@/components/landing/tenant-tree";
import { STORE_PUBLIC_DOMAIN } from "@/lib/tenant";

export function Architecture() {
  return (
    <section id="how" className="border-y bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="max-w-[60ch]">
          <h2 className="text-balance font-serif text-4xl leading-tight tracking-[-0.01em] sm:text-5xl">
            One platform. Every storefront.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            VocaCommerce is the root. From one platform it generates isolated tenants — each with its
            own subdomain of {STORE_PUBLIC_DOMAIN}, catalog, checkout, admin, and spoken assistant.
          </p>
        </div>
        <TenantTree />
      </div>
    </section>
  );
}
