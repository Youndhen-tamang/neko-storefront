import {
  Accessibility,
  CreditCard,
  ImagePlus,
  LayoutDashboard,
  Mic,
  Store,
} from "lucide-react";
import { STORE_PUBLIC_DOMAIN } from "@/lib/tenant";

const ROWS = [
  {
    icon: Store,
    title: "A storefront on its own subdomain",
    body: `Each shop lives at its own address on ${STORE_PUBLIC_DOMAIN}. Brand name, logo, tagline and color come from that shop's settings.`,
  },
  {
    icon: Mic,
    title: "Voice shopping for every customer",
    body: "Customers ask what is in stock, hear prices, and place orders by speaking. The assistant answers from live inventory, not a script.",
  },
  {
    icon: Accessibility,
    title: "Accessible commerce, not an afterthought",
    body: "Keyboard paths, labeled controls, and spoken shopping share the same storefront so B2B buyers can purchase however they work best.",
  },
  {
    icon: LayoutDashboard,
    title: "An admin for the shop owner",
    body: "Products, orders, alerts, notifications and settings, at /admin on the shop's own subdomain. Scoped to that shop and nothing else.",
  },
  {
    icon: CreditCard,
    title: "Stripe checkout",
    body: "The cart hands off to a Stripe Checkout session. The webhook confirms payment and records the order with an invoice number.",
  },
  {
    icon: ImagePlus,
    title: "Listings drafted from a photo",
    body: "Upload a product image and the assistant drafts the name, description, category and tags for you to edit and publish.",
  },
];

export function Capabilities() {
  return (
    <section id="included" className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <h2 className="text-balance font-serif text-4xl leading-tight tracking-[-0.01em] sm:text-5xl">
            What every shop ships with
          </h2>
          <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-muted-foreground">
            The same platform serves every tenant, so a new store starts voice-ready and accessible
            on day one.
          </p>
        </div>

        <div className="lg:col-span-8">
          <ul className="divide-y border-y">
            {ROWS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="grid gap-3 py-6 sm:grid-cols-[2rem_1fr] sm:gap-6">
                <Icon className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
                <div className="grid gap-1.5 sm:grid-cols-[minmax(0,17rem)_1fr] sm:gap-8">
                  <h3 className="font-serif text-xl leading-snug">{title}</h3>
                  <p className="max-w-[52ch] leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-12 grid gap-8 rounded-2xl bg-primary p-6 text-primary-foreground sm:p-8 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Mic className="h-6 w-6" aria-hidden="true" />
              <h3 className="mt-4 text-balance font-serif text-3xl leading-tight">
                A spoken assistant that answers from live stock
              </h3>
              <p className="mt-3 leading-relaxed text-primary-foreground/80">
                Talk to any storefront. It reads current products before it replies, so it never
                promises something that sold out an hour ago.
              </p>
            </div>
            <div className="lg:col-span-3">
              <ol className="space-y-3 text-sm" aria-label="Sample spoken conversation">
                <Bubble who="Customer">Do you still have the ash stool, and how much is it?</Bubble>
                <Bubble who="Assistant" reply>
                  Yes. The ash stool is NPR 180 and there are 6 in stock right now. It's on the Shop
                  page, first row. Shall I add one to your order?
                </Bubble>
                <Bubble who="Customer">Yes. Anything in linen under NPR 100?</Bubble>
                <Bubble who="Assistant" reply>
                  The linen throw is NPR 96 with 12 in stock. That's the only linen piece published
                  today. I can add that too.
                </Bubble>
              </ol>
              <p className="mt-4 text-xs text-primary-foreground/70">
                Sample voice conversation, sample catalog.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bubble({ who, reply = false, children }: { who: string; reply?: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex ${reply ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] rounded-xl px-4 py-3 leading-relaxed ${
          reply ? "bg-card text-card-foreground" : "bg-primary-foreground/15 text-primary-foreground"
        }`}
      >
        <span className="sr-only">{who}: </span>
        {children}
      </div>
    </li>
  );
}
