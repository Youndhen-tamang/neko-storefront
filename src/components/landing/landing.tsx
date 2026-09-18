import Link from "next/link";
import { Architecture } from "@/components/landing/architecture";
import { Capabilities } from "@/components/landing/capabilities";
import { Doors } from "@/components/landing/doors";
import { Hero } from "@/components/landing/hero";
import { Path } from "@/components/landing/path";

export function Landing() {
  return (
    <div className="landing min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Neko home">
            <span className="brand-dot h-2.5 w-2.5 rounded-full" aria-hidden="true" />
            <span className="font-serif text-xl leading-none">Neko</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm md:flex" aria-label="Sections">
            <a href="#how" className="link-quiet">
              How it works
            </a>
            <a href="#included" className="link-quiet">
              What's included
            </a>
            <a href="#doors" className="link-quiet">
              Doors
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/login"
              className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              Sign in
            </Link>
            <a
              href="#open"
              className="inline-flex h-9 items-center rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open a store
            </a>
          </div>
        </div>
      </header>

      <main>
        <Hero />
        <Architecture />
        <Capabilities />
        <Path />
        <Doors />
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2.5">
            <span className="brand-dot h-2 w-2 rounded-full" aria-hidden="true" />
            <span className="text-foreground">Neko</span> · multi-tenant storefront
          </p>
          <p className="tabular-nums">API on :4000 · shops on :3000 · super admin on :3004</p>
        </div>
      </footer>
    </div>
  );
}
