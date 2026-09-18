"use client";

import { useEffect, useRef } from "react";
import { Lock, ShoppingBag } from "lucide-react";

type Sample = { name: string; price: string; stock: string; art: React.ReactNode };

const SAMPLES: Sample[] = [
  {
    name: "Ash stool",
    price: "$180",
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
    price: "$96",
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
    price: "$64",
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

  // One authored motion: the frame leans toward the pointer. Skipped when the visitor prefers reduced motion.
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
  const host = `${slug || "your-store"}.localhost:3000`;

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
          <span className="font-serif text-base leading-none">{brandName.trim() || "Your store"}</span>
        </div>
        <nav className="flex items-center gap-3 text-[11px] text-muted-foreground" aria-hidden="true">
          <span className="text-foreground">Shop</span>
          <span className="inline-flex items-center gap-1">
            <ShoppingBag className="h-3 w-3" /> 0
          </span>
          <span>Admin</span>
        </nav>
      </div>

      <div className="px-4 pb-4 pt-4">
        <p className="font-serif text-lg leading-tight">Objects made to last, ready to ship.</p>
        <p className="mt-1 text-[11px] text-muted-foreground">Sample catalog · stock reads from the store database</p>
        <ul className="mt-3 grid grid-cols-3 gap-2.5">
          {SAMPLES.map((item) => (
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
                  Add to cart
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
