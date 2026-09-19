"use client";

import { useEffect, useRef } from "react";
import { Lock, MessageCircle, Mic, RotateCcw, ShoppingBag, Volume2, X } from "lucide-react";
import { publicStoreHost } from "@/lib/tenant";

type Sample = { name: string; price: string; stock: string; art: React.ReactNode };

const GENERIC_SAMPLES: Sample[] = [
  {
    name: "Ash stool",
    price: "NPR 180",
    stock: "6 in stock",
    art: (
      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <ellipse cx="40" cy="22" rx="24" ry="7" />
        <path d="M20 26 L14 66 M60 26 L66 66 M40 29 L40 66" />
        <path d="M17 48 H63" strokeDasharray="3 4" />
      </svg>
    ),
  },
  {
    name: "Linen throw",
    price: "NPR 96",
    stock: "12 in stock",
    art: (
      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14 30 C26 20, 40 40, 66 26 L66 58 C52 66, 30 50, 14 62 Z" />
        <path d="M22 40 C34 34, 46 48, 58 40" strokeDasharray="2 4" />
        <path d="M22 50 C34 44, 46 58, 58 50" strokeDasharray="2 4" />
      </svg>
    ),
  },
  {
    name: "Stoneware carafe",
    price: "NPR 64",
    stock: "3 in stock",
    art: (
      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M34 12 H46 L48 24 C58 30, 60 44, 58 66 H22 C20 44, 22 30, 32 24 Z" />
        <path d="M34 12 C36 6, 44 6, 46 12" />
        <path d="M26 54 H54" strokeDasharray="3 4" />
      </svg>
    ),
  },
];

const LUMINA_SAMPLES: Sample[] = [
  {
    name: "Little Black Dress",
    price: "NPR 188",
    stock: "Sold out",
    art: (
      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M28 14 C32 22, 48 22, 52 14" />
        <path d="M28 14 L24 26 L32 30 L32 70 H48 L48 30 L56 26 L52 14" />
        <path d="M32 30 H48" />
      </svg>
    ),
  },
  {
    name: "Linen Wrap Blouse",
    price: "NPR 78",
    stock: "18 in stock",
    art: (
      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M26 18 L32 28 L40 24 L48 28 L54 18" />
        <path d="M32 28 L28 66 H52 L48 28" />
        <path d="M40 24 L34 66 M40 24 L46 50" />
      </svg>
    ),
  },
  {
    name: "Oversized Wool Coat",
    price: "NPR 248",
    stock: "5 in stock",
    art: (
      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M24 18 L32 28 L40 22 L48 28 L56 18" />
        <path d="M32 28 L22 70 H58 L48 28" />
        <path d="M40 22 V70" />
        <path d="M28 48 H36 M44 48 H52" />
      </svg>
    ),
  },
];

export function StorePreview({
  brandName,
  slug,
  color,
}: {
  brandName: string;
  slug: string;
  color: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const isLumina = slug === "lumina";
  const samples = isLumina ? LUMINA_SAMPLES : GENERIC_SAMPLES;
  const tagline = isLumina ? "Elevated essentials for modern women" : "Ask for a piece. Hear if it is in stock.";
  const sub = isLumina
    ? "Live catalog · shop by voice or click"
    : "Sample catalog · shop by voice or click";

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const parent = el.closest<HTMLElement>(".hero-panel");
    if (!parent) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--ry", `${x * 6}deg`);
        el.style.setProperty("--rx", `${-y * 6}deg`);
      });
    };
    const reset = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--rx", "0deg");
    };
    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", reset);
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", reset);
      cancelAnimationFrame(raf);
    };
  }, []);

  const initial = (brandName.trim() || "S").slice(0, 1).toUpperCase();
  const host = publicStoreHost(slug || "your-store");

  return (
    <div
      ref={frame}
      className="preview-frame w-full overflow-hidden rounded-xl bg-card text-card-foreground shadow-[0_30px_60px_-30px_hsl(var(--ink)/0.6)]"
      style={{ ["--brand" as string]: color }}
    >
      <div className="flex items-center gap-3 border-b bg-secondary/60 px-3 py-2">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
        </div>
        <div className="flex h-7 flex-1 items-center gap-2 rounded-md border bg-background px-2.5 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" aria-hidden="true" />
          <span className="truncate tabular-nums text-foreground">{host}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-7 w-7 place-items-center rounded-full text-xs text-white transition-colors duration-500"
            style={{ backgroundColor: "var(--brand)" }}
          >
            {initial}
          </span>
          <div>
            <span className="block font-serif text-base leading-none">{brandName.trim() || "Your store"}</span>
            {isLumina && (
              <span className="mt-1 block text-[10px] text-muted-foreground">Elevated essentials for modern women</span>
            )}
          </div>
        </div>
        <nav className="flex items-center gap-3 text-[11px] text-muted-foreground" aria-hidden="true">
          <span className="text-foreground">Shop</span>
          {isLumina ? <span>Try on</span> : null}
          <span className="inline-flex items-center gap-1">
            <Mic className="h-3 w-3" /> {isLumina ? "Ask shop" : "Voice"}
          </span>
          <span className="inline-flex items-center gap-1">
            <ShoppingBag className="h-3 w-3" /> 0
          </span>
        </nav>
      </div>

      <div className="relative px-4 pb-4 pt-4">
        <p className="font-serif text-lg leading-tight">{isLumina ? "Elevated essentials for modern women" : tagline}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>
        <ul className="mt-3 grid grid-cols-3 gap-2.5">
          {samples.map((item) => (
            <li key={item.name} className="overflow-hidden rounded-lg border">
              <div
                className="aspect-[4/5] p-3 transition-colors duration-500"
                style={{ color: "var(--brand)", backgroundColor: "color-mix(in oklab, var(--brand) 12%, white)" }}
              >
                {item.art}
              </div>
              <div className="space-y-1.5 p-2">
                <p className="font-serif text-xs leading-tight">{item.name}</p>
                <p className="text-[10px] tabular-nums text-muted-foreground">
                  {item.price} · {item.stock}
                </p>
                <span
                  className="block rounded-md py-1 text-center text-[10px] font-medium text-white transition-colors duration-500"
                  style={{ backgroundColor: "var(--brand)" }}
                >
                  {item.stock === "Sold out" ? "Sold out" : "Add to cart"}
                </span>
              </div>
            </li>
          ))}
        </ul>
        {isLumina ? <PreviewChat brandName={brandName.trim() || "Lumina"} /> : null}
      </div>
    </div>
  );
}

function PreviewChat({ brandName }: { brandName: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3" aria-hidden="true">
      <div className="relative ml-auto w-[min(100%,19.5rem)]">
        <span
          className="absolute -left-[4.25rem] bottom-2 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-medium text-white shadow-sm"
          style={{ backgroundColor: "var(--brand)" }}
        >
          <MessageCircle className="h-3 w-3" />
          Ask shop
        </span>
        <div className="relative z-10 overflow-hidden rounded-2xl border bg-card shadow-[0_16px_36px_-18px_hsl(var(--ink)/0.55)]">
        <div className="flex items-start justify-between gap-2 border-b px-3 py-2">
          <div>
            <p className="text-[11px] font-medium leading-none">Store assistant</p>
            <p className="mt-1 text-[9px] text-muted-foreground">Speak or type. We never take card numbers here.</p>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="rounded-md p-0.5 text-foreground">
              <Volume2 className="h-3 w-3" />
            </span>
            <RotateCcw className="h-3 w-3 opacity-70" />
            <X className="h-3 w-3 opacity-70" />
          </div>
        </div>

        <div className="space-y-2 px-3 py-2.5">
          <p className="mr-4 rounded-xl bg-muted px-2.5 py-2 text-[10px] leading-relaxed">
            Hi, how can we help you at {brandName}? Ask me anything. Whenever you want, I can also read live
            inventory and place a dress order for you. I never ask for card numbers here.
          </p>
          <p className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
            <span className="inline-flex h-3 items-end gap-px" aria-hidden="true">
              <span className="preview-voice-bar w-px rounded-full bg-[var(--brand)]" style={{ animationDelay: "0ms" }} />
              <span className="preview-voice-bar w-px rounded-full bg-[var(--brand)]" style={{ animationDelay: "120ms" }} />
              <span className="preview-voice-bar h-full w-px rounded-full bg-[var(--brand)]" style={{ animationDelay: "240ms" }} />
              <span className="preview-voice-bar w-px rounded-full bg-[var(--brand)]" style={{ animationDelay: "80ms" }} />
            </span>
            Listening… you can speak even while I am reading.
          </p>
        </div>

        <div className="flex items-center gap-1.5 border-t p-2">
          <span
            className="h-7 min-w-0 flex-1 truncate rounded-md border bg-background px-2 text-[9px] leading-7 text-muted-foreground"
            style={{ boxShadow: "0 0 0 1px color-mix(in oklab, var(--brand) 55%, transparent)" }}
          >
            Ask anything, or say what you'd like to order
          </span>
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-white"
            style={{ backgroundColor: "var(--brand)" }}
          >
            <Mic className="h-3 w-3" />
          </span>
          <span
            className="grid h-7 shrink-0 place-items-center rounded-md px-2 text-[9px] font-medium text-white"
            style={{ backgroundColor: "color-mix(in oklab, var(--brand) 72%, white)" }}
          >
            Send
          </span>
        </div>
        </div>
      </div>
    </div>
  );
}
