"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, Mail, Package, Printer, Sparkles, Truck } from "lucide-react";
import { ConfettiBurst } from "@/components/shop/confetti-burst";
import { useShop } from "@/components/shop/shop-context";
import { Button } from "@/components/ui/button";
import { Order } from "@/lib/api";
import { toast } from "sonner";
import { downloadOrderReceipt } from "@/lib/receipt-pdf";
import { cn, money } from "@/lib/utils";

const STEPS = [
  {
    id: "paid",
    title: "Payment received",
    body: "Stripe confirmed this order. Your invoice is locked in and the atelier has the brief.",
    icon: Check,
  },
  {
    id: "prep",
    title: "Packed with care",
    body: "Pieces are checked, pressed, and wrapped. You’ll get a note when they leave the studio.",
    icon: Package,
  },
  {
    id: "ship",
    title: "On the way",
    body: "Most orders leave within two business days and travel for three to five more.",
    icon: Truck,
  },
  {
    id: "home",
    title: "At your door",
    body: "Try it on at home. Keep the invoice number handy if you’d like to comment on a piece.",
    icon: Sparkles,
  },
] as const;

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(date);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function currentStep(status: string) {
  if (status === "delivered") return 3;
  if (status === "dispatched") return 2;
  if (status === "ordered" || status === "lead") return 1;
  return 1;
}

function SuccessMark() {
  return (
    <div className="relative mx-auto grid h-24 w-24 place-items-center">
      <span className="absolute inset-0 rounded-full bg-primary/20 animate-success-ring motion-reduce:animate-none" />
      <span className="absolute inset-2 rounded-full bg-primary/15 animate-success-ring motion-reduce:animate-none [animation-delay:280ms]" />
      <svg viewBox="0 0 52 52" className="relative h-20 w-20 animate-success-pop">
        <circle
          className="success-mark-circle animate-success-draw-circle"
          cx="26"
          cy="26"
          r="24"
          fill="hsl(var(--primary))"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />
        <path
          className="success-mark-check animate-success-draw-check"
          d="M16 27.5 23 34.5 36 18.5"
          fill="none"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function OrderConfirmed({
  order,
  error,
  loading,
}: {
  order: Order | null;
  error: string;
  loading: boolean;
}) {
  const { branding } = useShop();
  const [copied, setCopied] = useState(false);
  const [burst, setBurst] = useState(1);
  const [openStep, setOpenStep] = useState(1);
  const [pdfBusy, setPdfBusy] = useState(false);

  useEffect(() => {
    if (order) setOpenStep(currentStep(order.status));
  }, [order]);

  const created = useMemo(() => (order ? new Date(order.created_at) : new Date()), [order]);
  const active = currentStep(order?.status || "ordered");
  const itemCount = order?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = order?.subtotal_cents ?? order?.total_cents ?? 0;

  async function copyInvoice() {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.invoice_number);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function tilt(event: React.MouseEvent<HTMLElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    event.currentTarget.style.setProperty("--rx", `${(0.5 - y) * 5}deg`);
    event.currentTarget.style.setProperty("--ry", `${(x - 0.5) * 7}deg`);
  }

  function untilt(event: React.MouseEvent<HTMLElement>) {
    event.currentTarget.style.setProperty("--rx", "0deg");
    event.currentTarget.style.setProperty("--ry", "0deg");
  }

  async function downloadPdf() {
    if (!order) return;
    setPdfBusy(true);
    try {
      await downloadOrderReceipt(order, branding);
    } catch {
      toast.error("Couldn't create the PDF. Try Print receipt.");
    } finally {
      setPdfBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="relative mx-auto grid h-20 w-20 place-items-center">
          <span className="absolute inset-0 rounded-full border-2 border-dashed border-primary/40 animate-spin motion-reduce:animate-none" />
        </div>
        <p className="mt-6 text-sm uppercase tracking-[0.2em] text-muted-foreground">Almost there</p>
        <h1 className="mt-2 font-serif text-4xl">Confirming your order</h1>
        <p className="mt-3 text-muted-foreground">We’re matching this payment with your bag.</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Checkout</p>
        <h1 className="mt-2 font-serif text-4xl">We can’t find that order</h1>
        <p className="mt-4 text-muted-foreground">
          {error || "Open this page from the Stripe confirmation link so we can load your invoice."}
        </p>
        <Button className="mt-8" asChild>
          <Link href="/">Back to the shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-5xl pb-8">
      <ConfettiBurst burst={burst} />

      <div className="text-center">
        <SuccessMark />
        <p className="mt-6 text-sm uppercase tracking-[0.22em] text-muted-foreground animate-success-fade-up">
          Order confirmed
        </p>
        <h1
          className="mt-2 font-serif text-5xl leading-tight animate-success-fade-up sm:text-6xl"
          style={{ animationDelay: "80ms" }}
        >
          Thank you, {firstName(order.customer_name)}
        </h1>
        <p
          className="mx-auto mt-4 max-w-lg text-muted-foreground animate-success-fade-up"
          style={{ animationDelay: "160ms" }}
        >
          {branding?.brandName || "The studio"} has your order. A receipt is on its way to{" "}
          <span className="text-foreground">{order.customer_email}</span>
          {order.email_sent ? "." : " once email is configured."}
        </p>
        <div
          className="mt-6 flex flex-wrap items-center justify-center gap-2 animate-success-fade-up"
          style={{ animationDelay: "220ms" }}
        >
          <button
            type="button"
            onClick={() => void copyInvoice()}
            className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm hover:bg-accent"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Invoice copied" : order.invoice_number}
          </button>
          <button
            type="button"
            className="success-no-print inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm hover:bg-accent disabled:opacity-60"
            onClick={() => void downloadPdf()}
            disabled={pdfBusy}
          >
            <Download className="h-3.5 w-3.5" />
            {pdfBusy ? "Preparing PDF..." : "Download PDF"}
          </button>
          <button
            type="button"
            className="success-no-print inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm hover:bg-accent"
            onClick={() => window.print()}
          >
            <Printer className="h-3.5 w-3.5" />
            Print receipt
          </button>
          <button
            type="button"
            className="success-no-print inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm hover:bg-accent"
            onClick={() => setBurst((n) => n + 1)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Celebrate again
          </button>
        </div>
      </div>

      <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <article
          className="success-tilt success-paper rounded-3xl border bg-card p-6 shadow-sm animate-success-fade-up sm:p-8"
          style={{ animationDelay: "280ms" }}
          onMouseMove={tilt}
          onMouseLeave={untilt}
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Receipt</p>
              <h2 className="mt-1 font-serif text-3xl">Your pieces</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>

          <ul className="mt-6 divide-y">
            {order.items.map((item, index) => {
              const inner = (
                <div className="flex gap-4 py-4">
                  <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium group-hover:underline">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × {money(item.unit_price_cents)}
                    </p>
                  </div>
                  <p className="text-sm tabular-nums">{money(item.unit_price_cents * item.quantity)}</p>
                </div>
              );
              return (
                <li key={`${item.name}-${index}`}>
                  {item.product_id ? (
                    <Link href={`/products/${item.product_id}`} className="group block">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>

          <dl className="mt-2 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{money(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-muted-foreground">Included at checkout</dd>
            </div>
            <div className="flex justify-between border-t pt-3 text-base font-medium">
              <dt>Total</dt>
              <dd className="tabular-nums">{money(order.total_cents)}</dd>
            </div>
          </dl>
        </article>

        <div className="space-y-6 animate-success-fade-up" style={{ animationDelay: "360ms" }}>
          <section className="rounded-3xl border bg-card p-6">
            <h2 className="font-serif text-2xl">What happens next</h2>
            <p className="mt-1 text-sm text-muted-foreground">Open a step to see the plan for this order.</p>
            <ol className="mt-5 space-y-2">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const done = index < active;
                const current = index === active;
                const open = openStep === index;
                return (
                  <li key={step.id}>
                    <button
                      type="button"
                      onClick={() => setOpenStep(index)}
                      className={cn(
                        "w-full rounded-2xl border px-3 py-3 text-left transition-colors",
                        open ? "border-primary/40 bg-primary/5" : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "grid h-9 w-9 place-items-center rounded-full",
                            done || current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex-1 font-medium">{step.title}</span>
                        {current && <span className="text-xs uppercase tracking-wide text-primary">Now</span>}
                      </div>
                      {open && <p className="mt-2 pl-12 text-sm text-muted-foreground">{step.body}</p>}
                    </button>
                  </li>
                );
              })}
            </ol>
            <p className="mt-4 text-xs text-muted-foreground">
              Packed by {formatDay(addDays(created, 2))}. Typical arrival {formatDay(addDays(created, 7))}.
            </p>
          </section>

          {(order.shipping_address || order.customer_email) && (
            <section className="rounded-3xl border bg-card p-6">
              <h2 className="font-serif text-2xl">Shipping to</h2>
              <p className="mt-3 font-medium">{order.customer_name}</p>
              {order.shipping_address && (
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{order.shipping_address}</p>
              )}
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {order.customer_email}
              </p>
            </section>
          )}
        </div>
      </div>

      <div
        className="success-no-print mt-10 flex flex-wrap items-center justify-center gap-3 animate-success-fade-up"
        style={{ animationDelay: "420ms" }}
      >
        <Button size="lg" asChild>
          <Link href="/">Continue shopping</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/try-on">Try another look</Link>
        </Button>
      </div>
    </div>
  );
}
