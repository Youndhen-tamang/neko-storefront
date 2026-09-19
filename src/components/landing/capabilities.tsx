import { Bell, CreditCard, ImagePlus, LayoutDashboard, Mail, MessageSquare, Store } from "lucide-react";

const ROWS = [
  {
    icon: Store,
    title: "A storefront on its own subdomain",
    body: "Brand name, logo, tagline and primary color come from the shop's settings. The catalog reads live stock straight from the database.",
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
    icon: Mail,
    title: "Invoice emails",
    body: "A paid order sends the customer an invoice over SMTP, with line items and the shop's own name on it.",
  },
  {
    icon: ImagePlus,
    title: "Listings drafted from a photo",
    body: "Upload a product image to Cloudinary and the assistant drafts the name, description, category and tags for you to edit.",
  },
  {
    icon: Bell,
    title: "Alerts and notifications",
    body: "Low stock and new orders surface in the admin so the owner sees what needs attention without opening every page.",
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
            The same code serves every shop, so a new one starts with the whole kit on day one.
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
              <MessageSquare className="h-6 w-6" aria-hidden="true" />
              <h3 className="mt-4 text-balance font-serif text-3xl leading-tight">
                An assistant that answers from live stock
              </h3>
              <p className="mt-3 leading-relaxed text-primary-foreground/80">
                The chat widget on every storefront reads the shop's current products before it replies,
                so it never promises something that sold out an hour ago.
              </p>
            </div>
            <div className="lg:col-span-3">
              <ol className="space-y-3 text-sm" aria-label="Sample conversation">
                <Bubble who="Customer">Do you still have the ash stool, and how much is it?</Bubble>
                <Bubble who="Assistant" reply>
                  Yes. The ash stool is NPR 180 and there are 6 in stock right now. It's on the Shop page,
                  first row.
                </Bubble>
                <Bubble who="Customer">Anything in linen under NPR 100?</Bubble>
                <Bubble who="Assistant" reply>
                  The linen throw is NPR 96 with 12 in stock. That's the only linen piece published today.
                </Bubble>
              </ol>
              <p className="mt-4 text-xs text-primary-foreground/70">Sample conversation, sample catalog.</p>
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
