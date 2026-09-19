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
    title: "VocaCommerce — Accessible B2B Commerce for Everyone",
    description:
      "A multi-tenant platform where anyone can create an accessible e-commerce store, and customers can interact with those stores through voice.",
  };
}

// Bare host shows the platform landing; a tenant subdomain shows that store's templated home.
export default async function HomePage() {
  const slug = await currentSlug();
  return slug ? <StoreHome /> : <Landing />;
}
