import Link from "next/link";
import { Architecture } from "@/components/landing/architecture";
import { Capabilities } from "@/components/landing/capabilities";
import { Doors } from "@/components/landing/doors";
import { Hero } from "@/components/landing/hero";
import { LegalFooter } from "@/components/landing/legal-shell";
import { Path } from "@/components/landing/path";
import { Voice } from "@/components/landing/voice";

export function Landing() {
  return (
    <div className="landing min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="VocaCommerce home">
            <span className="brand-dot h-2.5 w-2.5 rounded-full" aria-hidden="true" />
            <span className="font-serif text-xl leading-none">VocaCommerce</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm md:flex" aria-label="Sections">
            <a href="#how" className="link-quiet">
              How it works
            </a>
            <a href="#voice" className="link-quiet">
              Voice shopping
            </a>
            <a href="#included" className="link-quiet">
              What's included
            </a>
            <Link href="/request" className="link-quiet">
              Request a store
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/login"
              className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              Sign in
            </Link>
            <Link
              href="/request"
              className="inline-flex h-9 items-center rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Request a store
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Hero />
        <Architecture />
        <Voice />
        <Capabilities />
        <Path />
        <Doors />
      </main>

      <LegalFooter />
    </div>
  );
}
