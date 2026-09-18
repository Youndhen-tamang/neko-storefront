"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Branding, api, getAgencySlug } from "@/lib/api";
import { cartCount, openCartDrawer } from "@/lib/cart";
import { storeUrlForSlug } from "@/lib/tenant";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { ChatWidget } from "@/components/chat/chat-widget";
import { ShopContext } from "@/components/shop/shop-context";
import { cn } from "@/lib/utils";
import { LandingTemplateId, normalizeLandingTemplate } from "@/lib/templates";

function hexToHsl(hex: string) {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function ShopShell({
  children,
  flush = false,
  templateOverride,
}: {
  children: React.ReactNode;
  flush?: boolean;
  templateOverride?: LandingTemplateId;
}) {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [count, setCount] = useState(0);
  const [missing, setMissing] = useState(false);
  const [manualSlug, setManualSlug] = useState("");
  const template = templateOverride || normalizeLandingTemplate(branding?.landingTemplate);

  useEffect(() => {
    const current = getAgencySlug();
    if (!current) {
      setMissing(true);
      return;
    }
    api<{ branding: Branding }>("/api/settings/branding")
      .then((data) => {
        setBranding(data.branding);
        document.documentElement.style.setProperty(
          "--primary",
          hexToHsl(data.branding.primaryColor || "#1f6b4a")
        );
        document.documentElement.style.setProperty("--ring", hexToHsl(data.branding.primaryColor || "#1f6b4a"));
        document.title = data.branding.brandName;
      })
      .catch(() => setMissing(true));
    const refresh = () => setCount(cartCount(current));
    refresh();
    window.addEventListener("cart-updated", refresh);
    return () => window.removeEventListener("cart-updated", refresh);
  }, []);

  if (missing && !branding) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <h1 className="font-serif text-3xl">Open a store</h1>
        <p className="mt-2 text-muted-foreground">
          Stores live on a subdomain, for example lumen.localhost:3000.
        </p>
        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const value = manualSlug.trim();
            if (value) window.location.href = storeUrlForSlug(value);
          }}
        >
          <input
            className="h-10 flex-1 rounded-md border bg-background px-3"
            placeholder="lumen"
            value={manualSlug}
            onChange={(e) => setManualSlug(e.target.value)}
          />
          <button type="submit" className="h-10 rounded-md bg-primary px-4 text-primary-foreground">
            Open
          </button>
        </form>
      </div>
    );
  }

  if (!branding) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading store...
      </div>
    );
  }

  return (
    <ShopContext.Provider
      value={{
        branding,
        cartItemCount: count,
        template,
      }}
    >
      <div className="min-h-screen">
        <header
          className={cn(
            "sticky top-0 z-20 border-b backdrop-blur",
            template === "boutique"
              ? "border-neutral-800 bg-neutral-950/90 text-white"
              : template === "marketplace"
                ? "bg-white/95"
                : "bg-background/90"
          )}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              {branding?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={branding.logoUrl} alt={branding.brandName} className="h-9 w-auto" />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm text-primary-foreground">
                  {(branding?.brandName || "S").slice(0, 1)}
                </span>
              )}
              <div>
                <p
                  className={cn(
                    "leading-none",
                    template === "marketplace" ? "text-base font-semibold" : "font-serif text-lg"
                  )}
                >
                  {branding?.brandName || "Store"}
                </p>
                {branding?.tagline && template !== "marketplace" && (
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      template === "boutique" ? "text-white/60" : "text-muted-foreground"
                    )}
                  >
                    {branding.tagline}
                  </p>
                )}
              </div>
            </Link>
            <nav
              className={cn(
                "flex items-center gap-5 text-sm",
                template === "marketplace" && "uppercase tracking-wide",
                template === "boutique" && "text-white/80"
              )}
            >
              <Link href="/">Shop</Link>
              <Link href="/try-on">Try on</Link>
              <button type="button" onClick={() => openCartDrawer()}>
                Cart ({count})
              </button>
              <Link
                href="/admin/login"
                className={template === "boutique" ? "text-white/50" : "text-muted-foreground"}
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>
        <main className={flush ? "" : "mx-auto max-w-6xl px-6 py-10"}>{children}</main>
        <CartDrawer />
        <ChatWidget brandName={branding?.brandName || "Store"} />
      </div>
    </ShopContext.Provider>
  );
}
