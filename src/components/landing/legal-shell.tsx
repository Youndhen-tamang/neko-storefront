import Link from "next/link";
import { STORE_PUBLIC_DOMAIN } from "@/lib/tenant";

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="landing min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="VocaCommerce home">
            <span className="brand-dot h-2.5 w-2.5 rounded-full" aria-hidden="true" />
            <span className="font-serif text-xl leading-none">VocaCommerce</span>
          </Link>
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

      <main className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span aria-hidden="true"> · </span>
          {title}
        </p>
        <h1 className="mt-4 text-balance font-serif text-4xl leading-tight tracking-[-0.02em] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated {updated}</p>
        <div className="legal-copy mt-12 space-y-10">{children}</div>
      </main>

      <LegalFooter />
    </div>
  );
}

export function LegalFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2.5">
          <span className="brand-dot h-2 w-2 rounded-full" aria-hidden="true" />
          <span className="text-foreground">VocaCommerce</span> · accessible B2B commerce
        </p>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Legal">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms of Use
          </Link>
          <span className="tabular-nums">{STORE_PUBLIC_DOMAIN}</span>
        </nav>
      </div>
    </footer>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-2xl leading-snug tracking-[-0.01em]">{title}</h2>
      <div className="space-y-3 text-[17px] leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
