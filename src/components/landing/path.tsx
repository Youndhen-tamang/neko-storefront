import { publicStoreHost } from "@/lib/tenant";

const STEPS = [
  {
    title: "Create the shop",
    body: "A super admin names the store, sets the slug, and assigns the owner. The storefront is live the moment it's saved.",
  },
  {
    title: "The owner signs in",
    body: `${publicStoreHost("your-store")}/admin opens the dashboard for that shop only.`,
  },
  {
    title: "Publish a catalog",
    body: "Upload a photo, let the assistant draft the listing, set price and stock, then publish. Voice shopping is already on.",
  },
  {
    title: "Customers buy — by voice or click",
    body: "They ask what's in stock, check out with Stripe, and receive an invoice. The owner sees the order in admin.",
  },
];

export function Path() {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <h2 className="max-w-[22ch] text-balance font-serif text-4xl leading-tight tracking-[-0.01em] sm:text-5xl">
          From a blank shop to a spoken first order
        </h2>
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative border-t pt-6">
              <span className="absolute -top-px left-0 h-px w-12 bg-primary" aria-hidden="true" />
              <span className="font-serif text-4xl tabular-nums text-primary">{i + 1}</span>
              <h3 className="mt-4 font-serif text-xl leading-snug">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
