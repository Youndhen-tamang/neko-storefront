"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShopShell } from "@/components/shop/shop-shell";
import { Button } from "@/components/ui/button";
import { Product, api, getAgencySlug } from "@/lib/api";
import { addToCart } from "@/lib/cart";
import { asStringArray, money } from "@/lib/utils";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAgencySlug()) return;
    api<{ products: Product[] }>("/api/products/public")
      .then((data) => setProducts(data.products))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ShopShell>
      <section className="mb-12 max-w-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Catalog</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight">Objects made to last, ready to ship.</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Browse live inventory. Stock shown here is read from the store database, not a cached catalog.
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
                    <p className="text-sm text-muted-foreground">
                      {money(product.price_cents)} · {product.stock} in stock
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    disabled={product.stock < 1}
                    onClick={() => {
                      addToCart(getAgencySlug(), product);
                      toast.success("Added to cart");
                    }}
                  >
                    {product.stock < 1 ? "Sold out" : "Add to cart"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </ShopShell>
  );
}
