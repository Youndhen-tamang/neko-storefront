import { Keyboard, Mic, Volume2 } from "lucide-react";

const PILLARS = [
  {
    icon: Mic,
    title: "Speak to shop",
    body: "Ask what's in stock, hear the price, and place an order. The microphone is a first-class way to use every store — not a hidden extra.",
  },
  {
    icon: Volume2,
    title: "Hear live inventory",
    body: "Spoken replies come from the shop's current catalog. If a piece sold out an hour ago, the assistant will not promise it.",
  },
  {
    icon: Keyboard,
    title: "Accessible by default",
    body: "Type, tap, or talk. Keyboard paths, screen-reader labels, and spoken shopping sit on the same storefront so nobody is locked out.",
  },
];

export function Voice() {
  return (
    <section id="voice" className="border-t">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="max-w-[54ch]">
          <h2 className="text-balance font-serif text-4xl leading-tight tracking-[-0.01em] sm:text-5xl">
            Customers shop by speaking.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            VocaCommerce is built so anyone can run a store, and anyone can buy from it. Voice is how
            customers browse, compare, and check out when a screen is not enough.
          </p>
        </div>

        <ul className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="relative border-t pt-6">
              <span className="absolute -top-px left-0 h-px w-12 bg-primary" aria-hidden="true" />
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="mt-4 font-serif text-2xl leading-snug">{title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
