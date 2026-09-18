"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShopShell } from "@/components/shop/shop-shell";
import { Button } from "@/components/ui/button";
import { Product, api, getAgencySlug } from "@/lib/api";
import { addToCart } from "@/lib/cart";
import { asStringArray, money } from "@/lib/utils";
import { ProductSocial } from "@/components/shop/product-social";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    api<{ product: Product }>(`/api/products/public/${params.id}`)
      .then((data) => setProduct(data.product))
      .catch((error) => toast.error(error.message));
  }, [params.id]);

  if (!product) {
    return (
      <ShopShell>
        <p>Loading product...</p>
      </ShopShell>
    );
  }

  const images = asStringArray(product.images);

  return (
    <ShopShell>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-muted">
          {images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images[0]} alt={product.name} className="w-full object-cover" />
          )}
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{product.category}</p>
          <h1 className="mt-2 font-serif text-5xl">{product.name}</h1>
          <p className="mt-4 text-2xl">{money(product.price_cents)}</p>
          <p className="mt-2 text-sm text-muted-foreground">{product.stock} currently in stock</p>
          <p className="mt-6 max-w-lg leading-7 text-muted-foreground">{product.description}</p>
          <Button
            className="mt-8"
            size="lg"
            disabled={product.stock < 1}
            onClick={() => {
              addToCart(getAgencySlug(), product);
              toast.success("Added to cart");
            }}
          >
            Add to cart
          </Button>
        </div>
      </div>
      <ProductSocial productId={product.id} />
    </ShopShell>
  );
}
