"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Product, Branding } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { asStringArray, money } from "@/lib/utils";
import { addProductToCart } from "@/components/shop/add-to-cart";

export function MarketplaceLanding({
  products,
  loading,
  branding,
}: {
  products: Product[];
  loading: boolean;
  branding: Branding | null;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const values = Array.from(
      new Set(products.map((product) => product.category).filter((value): value is string => Boolean(value)))
    );
    return ["all", ...values];
  }, [products]);

  const filtered = products.filter((product) => {
    const matchesCategory = category === "all" || product.category === category;
    const haystack = `${product.name} ${product.description || ""} ${product.category || ""}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="bg-white">
      <section className="border-b bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary-foreground/80">
              Shop live inventory
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {branding?.brandName || "Marketplace"}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-primary-foreground/80">
              {branding?.tagline || "Find what you need, filter by category, and check stock before you buy."}
            </p>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              className="h-11 border-0 bg-white pl-10 text-foreground"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              className={`rounded-full border px-3 py-1.5 text-sm capitalize ${
                category === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-muted"
              }`}
            >
              {value === "all" ? "All" : value}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading products...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground">
            {products.length === 0
              ? "This store has no published products yet."
              : "No products match those filters."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((product) => {
              const image = asStringArray(product.images)[0];
              return (
                <article key={product.id} className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-square bg-muted">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={product.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.category}</p>
                    <h2 className="mt-1 line-clamp-2 text-sm font-medium">{product.name}</h2>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div>
                        <p className="font-semibold">{money(product.price_cents)}</p>
                        <p className="text-xs text-muted-foreground">{product.stock} left</p>
                      </div>
                      <Button
                        size="sm"
                        disabled={product.stock < 1}
                        onClick={() => addProductToCart(product)}
                      >
                        {product.stock < 1 ? "Sold out" : "Add"}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
