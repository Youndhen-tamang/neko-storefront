const STEPS = [
  {
    title: "The super admin creates the shop",
    body: "Name, slug, brand and the owner's login. The shop is active the moment it's saved.",
  },
  {
    title: "The owner signs in on their subdomain",
    body: "slug.localhost:3000/admin opens the dashboard for that shop only.",
  },
  {
    title: "Upload a photo, publish the listing",
    body: "The assistant drafts the copy from the image. The owner edits, sets price and stock, publishes.",
  },
  {
    title: "A customer checks out",
    body: "Stripe takes payment, the webhook records the order, the invoice email goes out.",
  },
];

export function Path() {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <h2 className="max-w-[20ch] text-balance font-serif text-4xl leading-tight tracking-[-0.01em] sm:text-5xl">
          From zero to first order
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
