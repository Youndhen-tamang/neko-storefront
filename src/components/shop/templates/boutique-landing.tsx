"use client";

import Link from "next/link";
import { Product, Branding } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { asStringArray, money } from "@/lib/utils";
import { addProductToCart } from "@/components/shop/add-to-cart";

export function BoutiqueLanding({
  products,
  loading,
  branding,
}: {
  products: Product[];
  loading: boolean;
  branding: Branding | null;
}) {
  const featured = products[0];
  const featuredImage = featured ? asStringArray(featured.images)[0] : null;
  const lookbook = products.slice(0, 4);
  const rest = products.slice(4);

  return (
    <div>
      <section className="relative min-h-[72vh] overflow-hidden bg-neutral-950 text-white">
        {featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={featuredImage}
            alt={featured?.name || branding?.brandName || "Lookbook"}
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-neutral-700" />
        )}
        <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end px-6 py-16">
          <p className="text-xs uppercase tracking-[0.4em] text-white/70">New season</p>
          <h1 className="mt-4 max-w-xl font-serif text-6xl leading-[1.05]">
            {branding?.brandName || "Boutique"}
          </h1>
          <p className="mt-4 max-w-lg text-lg text-white/80">
            {branding?.tagline || "A considered edit of pieces made to be worn for years."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#collection">
              <Button size="lg" className="rounded-none px-8">
                Shop the collection
              </Button>
            </a>
            {featured && (
              <Link href={`/products/${featured.id}`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-none border-white/40 bg-transparent text-white hover:bg-white/10"
                >
                  Featured look
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section id="collection" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Lookbook</p>
            <h2 className="mt-2 font-serif text-4xl">Featured pieces</h2>
          </div>
          {branding?.email && (
            <p className="text-sm text-muted-foreground">Atelier inquiries · {branding.email}</p>
          )}
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground">This store has no published products yet.</p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {lookbook.map((product, index) => {
                const image = asStringArray(product.images)[0];
                return (
                  <article
                    key={product.id}
                    className={index === 0 ? "md:col-span-2" : undefined}
                  >
                    <Link href={`/products/${product.id}`} className="group block">
                      <div className={`${index === 0 ? "aspect-[16/8]" : "aspect-[4/5]"} overflow-hidden bg-muted`}>
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : null}
                      </div>
                    </Link>
                    <div className="flex items-end justify-between gap-4 py-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {product.category}
                        </p>
                        <h3 className="font-serif text-2xl">{product.name}</h3>
                        {product.description ? (
                          <p className="mt-1 line-clamp-2 max-w-lg text-sm text-muted-foreground">
                            {product.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{money(product.price_cents)}</p>
                        <Button
                          variant="ghost"
                          className="h-auto px-0"
                          disabled={product.stock < 1}
                          onClick={() => addProductToCart(product)}
                        >
                          {product.stock < 1 ? "Sold out" : "Add to bag"}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {rest.length > 0 && (
              <div className="mt-20">
                <h2 className="font-serif text-3xl">The rest of the edit</h2>
                <div className="mt-8 divide-y">
                  {rest.map((product) => {
                    const image = asStringArray(product.images)[0];
                    return (
                      <article key={product.id} className="grid items-center gap-6 py-6 sm:grid-cols-[140px_1fr_auto]">
                        <Link href={`/products/${product.id}`} className="block aspect-[3/4] overflow-hidden bg-muted">
                          {image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={image} alt={product.name} className="h-full w-full object-cover" />
                          ) : null}
                        </Link>
                        <div>
                          <h3 className="font-serif text-xl">{product.name}</h3>
                          {product.description ? (
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-4">
                          <p>{money(product.price_cents)}</p>
                          <Button disabled={product.stock < 1} onClick={() => addProductToCart(product)}>
                            {product.stock < 1 ? "Sold out" : "Add"}
                          </Button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {(branding?.address || branding?.phone) && (
        <footer className="border-t bg-neutral-950 px-6 py-12 text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 text-sm text-white/70 sm:flex-row sm:justify-between">
            <p className="font-serif text-xl text-white">{branding.brandName}</p>
            <div className="space-y-1">
              {branding.address && <p>{branding.address}</p>}
              {branding.phone && <p>{branding.phone}</p>}
              {branding.email && <p>{branding.email}</p>}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
