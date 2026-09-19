"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { StorePreview } from "@/components/landing/store-preview";
import { slugify } from "@/lib/slug";
import { publicStoreHost, storeUrlForSlug } from "@/lib/tenant";

const COLORS = [
  { name: "Lumina rose", value: "#7A3E49" },
  { name: "Forest", value: "#1f6b4a" },
  { name: "Ink blue", value: "#1e3a8a" },
  { name: "Plum", value: "#6b2153" },
  { name: "Terracotta", value: "#b3492a" },
  { name: "Charcoal", value: "#2b2b2b" },
];

export function Hero() {
  const [name, setName] = useState("Lumina");
  const [color, setColor] = useState(COLORS[0].value);
  const slug = useMemo(() => slugify(name), [name]);
  const target = slug ? storeUrlForSlug(slug) : "";

  return (
    <section
      id="preview"
      className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-10 lg:grid-cols-12 lg:gap-8 lg:pb-24 lg:pt-16"
    >
      <div className="flex flex-col justify-center lg:col-span-5">
        <h1 className="text-balance font-serif text-[2.75rem] leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-[4.5rem]">
          VocaCommerce
        </h1>
        <p className="mt-4 max-w-[22ch] text-balance font-serif text-2xl leading-snug tracking-[-0.01em] sm:text-3xl">
          Accessible B2B commerce for everyone.
        </p>
        <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-muted-foreground">
          A multi-tenant platform where anyone can create an accessible e-commerce store, and
          customers can interact with those stores through voice. Name a shop to see it take shape.
        </p>

        <form
          className="mt-10"
          onSubmit={(e) => {
            e.preventDefault();
            if (target) window.location.href = target;
          }}
        >
          <label htmlFor="store-name" className="text-sm font-medium">
            Store name
          </label>
          <div className="mt-2 flex h-12 items-center rounded-lg border bg-card pl-4 pr-1.5 shadow-[0_1px_0_hsl(var(--border))] focus-within:ring-2 focus-within:ring-ring">
            <input
              id="store-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              autoComplete="off"
              spellCheck={false}
              placeholder="Lumina"
              className="h-full min-w-0 flex-1 bg-transparent font-serif text-xl outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!slug}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
            >
              Open store <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-2 min-h-5 text-sm tabular-nums text-muted-foreground" aria-live="polite">
            {slug ? `Opens ${publicStoreHost(slug)}` : "Type a name to get a subdomain"}
          </p>

          <fieldset className="mt-6">
            <legend className="text-sm font-medium">Brand color</legend>
            <div className="mt-2 flex items-center gap-2.5">
              {COLORS.map((c) => {
                const active = c.value === color;
                return (
                  <button
                    key={c.value}
                    type="button"
                    aria-label={c.name}
                    aria-pressed={active}
                    onClick={() => setColor(c.value)}
                    className="grid h-8 w-8 place-items-center rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    style={{ backgroundColor: c.value }}
                  >
                    <span
                      className={`h-2 w-2 rounded-full bg-white transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </fieldset>
        </form>
      </div>

      <div className="lg:col-span-7">
        <div className="hero-panel relative isolate flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl bg-primary p-5 sm:p-10 lg:min-h-[560px]">
          <div className="hero-weave absolute inset-0 -z-10" aria-hidden="true" />
          <div className="w-full max-w-[520px] [perspective:1200px]">
            <StorePreview brandName={name} slug={slug} color={color} />
          </div>
        </div>
      </div>
    </section>
  );
}
