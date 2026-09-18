import type { Metadata } from "next";
import { headers } from "next/headers";
import { Landing } from "@/components/landing/landing";
import { StoreHome } from "@/components/shop/store-home";
import { agencySlugFromHost } from "@/lib/tenant";

async function currentSlug() {
  const host = (await headers()).get("host") || "";
  return agencySlugFromHost(host);
}

export async function generateMetadata(): Promise<Metadata> {
  if (await currentSlug()) return {};
  return {
    title: "Neko",
    description: "One backend, every storefront. Each shop on its own subdomain with its own admin.",
  };
}

// Bare host shows the platform landing; a tenant subdomain shows that store's templated home.
export default async function HomePage() {
  const slug = await currentSlug();
  return slug ? <StoreHome /> : <Landing />;
}
