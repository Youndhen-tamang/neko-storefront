"use client";

import { useEffect } from "react";
import { Branding, api, getAgencySlug } from "@/lib/api";

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

export function AgencyTheme({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const slug = getAgencySlug();
    if (!slug) return;
    api<{ branding: Branding }>("/api/settings/branding")
      .then((data) => {
        const color = hexToHsl(data.branding.primaryColor || "#1f6b4a");
        document.documentElement.style.setProperty("--primary", color);
        document.documentElement.style.setProperty("--ring", color);
      })
      .catch(() => undefined);
  }, []);

  return <>{children}</>;
}
