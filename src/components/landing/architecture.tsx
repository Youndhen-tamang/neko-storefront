"use client";

import { useEffect, useRef, useState } from "react";
import { Database, Server, ShieldCheck, Store } from "lucide-react";

const STORES = ["lumen", "atlas", "marlow"];

export function Architecture() {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="how" className="border-y bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="max-w-[60ch]">
          <h2 className="text-balance font-serif text-4xl leading-tight tracking-[-0.01em] sm:text-5xl">
            One backend. Every storefront.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            The API resolves the shop from the subdomain on every request. Products, orders, alerts and
            settings are scoped to that shop. Nothing is shared between shops except the code.
          </p>
        </div>

        <div ref={ref} className={`arch mt-14 ${drawn ? "arch-drawn" : ""}`}>
          <div className="grid gap-y-10 lg:grid-cols-[1fr_auto_1fr_auto_1.3fr] lg:items-center lg:gap-x-0">
            <Node
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Super admin"
              host="localhost:3004"
              lines={["Creates each shop", "Assigns its first admin", "Sees every order"]}
            />
            <Connector />
            <Node
              icon={<Server className="h-5 w-5" />}
              title="API"
              host="localhost:4000"
              lines={["Express + Knex", "Stripe, SMTP, Cloudinary", "OpenRouter for the assistant"]}
              footer={
                <span className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Database className="h-4 w-4" aria-hidden="true" /> PostgreSQL, one database
                </span>
              }
            />
            <Connector />
            <ul className="relative space-y-3 lg:pl-6">
              <span
                className="arch-spine absolute bottom-6 left-0 top-6 hidden w-px bg-primary lg:block"
                aria-hidden="true"
              />
              {STORES.map((slug, i) => (
                <li
                  key={slug}
                  className="arch-store relative flex items-center justify-between rounded-lg border bg-card px-4 py-3 lg:before:absolute lg:before:-left-6 lg:before:top-1/2 lg:before:h-px lg:before:w-6 lg:before:bg-primary"
                  style={{ transitionDelay: `${420 + i * 120}ms` }}
                >
                  <span className="flex items-center gap-3">
                    <Store className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="font-medium tabular-nums">{slug}.localhost:3000</span>
                  </span>
                  <span className="text-sm text-muted-foreground">/admin</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Node({
  icon,
  title,
  host,
  lines,
  footer,
}: {
  icon: React.ReactNode;
  title: string;
  host: string;
  lines: string[];
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
          {icon}
        </span>
        <div>
          <p className="font-serif text-xl leading-none">{title}</p>
          <p className="mt-1.5 text-sm tabular-nums text-muted-foreground">{host}</p>
        </div>
      </div>
      <ul className="mt-5 space-y-1.5 text-sm">
        {lines.map((line) => (
          <li key={line} className="flex items-start gap-2.5">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            {line}
          </li>
        ))}
      </ul>
      {footer}
    </div>
  );
}

function Connector() {
  return (
    <div className="arch-link relative mx-auto h-10 w-px lg:h-px lg:w-16" aria-hidden="true">
      <span className="arch-line absolute inset-0 bg-primary" />
      <span className="arch-dot absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary lg:-right-1 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0" />
    </div>
  );
}
