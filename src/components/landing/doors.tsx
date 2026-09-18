import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const SUPER_ADMIN_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_URL || "http://localhost:3004";

export function Doors() {
  return (
    <section id="doors" className="bg-[hsl(var(--ink))] text-[hsl(var(--ink-foreground))]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <h2 className="max-w-[18ch] text-balance font-serif text-4xl leading-tight tracking-[-0.01em] sm:text-5xl">
          Pick your door
        </h2>
        <ul className="mt-12 divide-y divide-white/10 border-y border-white/10">
          <Door
            href="/admin/login"
            title="Shop owner"
            body="Sign in to your shop's admin. You'll be taken to your subdomain first."
            action="Sign in"
          />
          <Door
            href={SUPER_ADMIN_URL}
            title="Super admin"
            body="Create shops, assign owners, and see orders across all of them."
            action="Open super admin"
            external
          />
          <Door
            href="#open"
            title="Shopper"
            body="Every shop has its own address. Type its name at the top to open it."
            action="Find a shop"
          />
        </ul>
      </div>
    </section>
  );
}

function Door({
  href,
  title,
  body,
  action,
  external = false,
}: {
  href: string;
  title: string;
  body: string;
  action: string;
  external?: boolean;
}) {
  const Comp = external ? "a" : Link;
  return (
    <li>
      <Comp
        href={href}
        className="door group grid items-center gap-2 py-7 transition-colors sm:grid-cols-[minmax(0,14rem)_1fr_auto] sm:gap-8 focus-visible:outline-none"
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        <h3 className="font-serif text-2xl leading-none">{title}</h3>
        <p className="max-w-[48ch] leading-relaxed text-[hsl(var(--ink-foreground)/0.7)]">{body}</p>
        <span className="mt-2 inline-flex items-center gap-2 text-sm font-medium sm:mt-0">
          {action}
          <ArrowUpRight
            className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </Comp>
    </li>
  );
}
