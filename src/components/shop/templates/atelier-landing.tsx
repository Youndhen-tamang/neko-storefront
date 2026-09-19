"use client";

import Link from "next/link";
import { Product, Branding } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { asStringArray, money } from "@/lib/utils";
import { addProductToCart } from "@/components/shop/add-to-cart";

export function AtelierLanding({
  products,
  loading,
  branding,
}: {
  products: Product[];
  loading: boolean;
  branding: Branding | null;
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <section className="mb-12 max-w-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Catalog</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight">
          {branding?.tagline || "Objects made to last, ready to ship."}
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Browse live inventory from {branding?.brandName || "this store"}. Stock shown here is read
          from the store database, not a cached catalog.
        </p>
      </section>
      {loading ? (
        <p className="text-muted-foreground">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">This store has no published products yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const image = asStringArray(product.images)[0];
            return (
              <article key={product.id} className="overflow-hidden rounded-2xl border bg-card">
                <Link href={`/products/${product.id}`}>
                  <div className="aspect-[4/5] bg-muted">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={product.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                </Link>
                <div className="space-y-3 p-4">
                  <div>
                    <h2 className="font-serif text-xl">{product.name}</h2>
                    {product.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                    ) : null}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {money(product.price_cents)} · {product.stock} in stock
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    disabled={product.stock < 1}
                    onClick={() => addProductToCart(product)}
                  >
                    {product.stock < 1 ? "Sold out" : "Add to cart"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
