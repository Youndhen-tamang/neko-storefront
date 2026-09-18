"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ShopShell } from "@/components/shop/shop-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product, TryOnSession, api, getAgencySlug } from "@/lib/api";
import { addToCart } from "@/lib/cart";
import { asStringArray, money } from "@/lib/utils";

const HEIGHT_KEY = "tryon_height_cm";
const WEIGHT_KEY = "tryon_weight_kg";
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

function readStoredNumber(key: string, fallback: number) {
  if (typeof window === "undefined") return fallback;
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function TryOnPageInner() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState(productId);
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [heightCm, setHeightCm] = useState(165);
  const [weightKg, setWeightKg] = useState(60);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<TryOnSession | null>(null);

  useEffect(() => {
    setHeightCm(readStoredNumber(HEIGHT_KEY, 165));
    setWeightKg(readStoredNumber(WEIGHT_KEY, 60));
  }, []);

  useEffect(() => {
    setSelectedId(productId);
    setSession(null);
  }, [productId]);

  useEffect(() => {
    if (!getAgencySlug()) return;
    api<{ products: Product[] }>("/api/products/public")
      .then((data) => setProducts(data.products))
      .catch((error) => toast.error(error.message));
  }, []);

  useEffect(() => {
    if (!photo) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const product = useMemo(
    () => products.find((item) => item.id === selectedId) || null,
    [products, selectedId]
  );
  const productImages = product ? asStringArray(product.images) : [];

  function onPhotoChange(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("Please choose a photo under 8 MB");
      return;
    }
    setPhoto(file);
    setSession(null);
  }

  async function generate() {
    if (!product) {
      toast.error("Choose a product to try on");
      return;
    }
    if (!productImages.length) {
      toast.error("This product has no photos to try on");
      return;
    }
    if (!photo) {
      toast.error("Upload a full-body photo first");
      return;
    }

    const form = new FormData();
    form.append("photo", photo);
    form.append("productId", product.id);
    form.append("heightCm", String(Math.round(heightCm)));
    form.append("weightKg", String(Math.round(weightKg)));

    setLoading(true);
    try {
      localStorage.setItem(HEIGHT_KEY, String(Math.round(heightCm)));
      localStorage.setItem(WEIGHT_KEY, String(Math.round(weightKg)));
      const data = await api<{ session: TryOnSession }>("/api/tryon", {
        method: "POST",
        body: form,
      });
      setSession(data.session);
      toast.success("Your try-on is ready");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Try-on failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ShopShell>
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Virtual fitting</p>
        <h1 className="mt-2 font-serif text-5xl">Try on you</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Upload a well-lit full-body photo. We keep your face, pose, and body, and dress you in the
          selected piece.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl bg-muted">
            {session?.resultUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.resultUrl} alt="Your try-on" className="w-full object-cover" />
            ) : previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Your photo" className="w-full object-cover" />
            ) : productImages[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={productImages[0]} alt={product?.name || "Product"} className="w-full object-cover" />
            ) : (
              <div className="grid aspect-[3/4] place-items-center px-6 text-center text-sm text-muted-foreground">
                Choose a product and upload a photo to see yourself in it.
              </div>
            )}
          </div>
          {session?.resultUrl && (
            <p className="text-sm text-muted-foreground">
              Suggested size for this height and weight:{" "}
              <span className="font-medium text-foreground">{session.sizeHint}</span>. This is a
              guide, not a fit guarantee.
            </p>
          )}
        </div>

        <form
          className="space-y-6 rounded-2xl border bg-card p-6"
          onSubmit={(event) => {
            event.preventDefault();
            void generate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="tryon-product">Product</Label>
            <select
              id="tryon-product"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={selectedId}
              onChange={(event) => {
                setSelectedId(event.target.value);
                setSession(null);
              }}
              required
            >
              <option value="">Select a piece</option>
              {products.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {money(item.price_cents)}
                </option>
              ))}
            </select>
            {product && (
              <Link href={`/products/${product.id}`} className="text-sm text-muted-foreground underline">
                View product details
              </Link>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tryon-photo">Full-body photo</Label>
            <Input
              id="tryon-photo"
              type="file"
              accept="image/*"
              onChange={(event) => onPhotoChange(event.target.files?.[0])}
            />
            <p className="text-xs text-muted-foreground">
              Face the camera, stand straight, and use even lighting. JPEG or PNG, up to 8 MB.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tryon-height">Height (cm)</Label>
              <Input
                id="tryon-height"
                type="number"
                min={100}
                max={230}
                value={heightCm}
                onChange={(event) => setHeightCm(Number(event.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tryon-weight">Weight (kg)</Label>
              <Input
                id="tryon-weight"
                type="number"
                min={30}
                max={250}
                value={weightKg}
                onChange={(event) => setWeightKg(Number(event.target.value))}
                required
              />
            </div>
          </div>

          <Button className="w-full" size="lg" type="submit" disabled={loading}>
            {loading ? "Dressing you in this piece..." : "See it on you"}
          </Button>
          {loading && (
            <p className="text-center text-xs text-muted-foreground">
              This usually takes 15–40 seconds. Keep this tab open.
            </p>
          )}

          {session && product && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={product.stock < 1}
              onClick={() => {
                addToCart(getAgencySlug(), product);
                toast.success("Added to cart");
              }}
            >
              {product.stock < 1 ? "Sold out" : `Add to cart · ${money(product.price_cents)}`}
            </Button>
          )}
        </form>
      </div>
    </ShopShell>
  );
}

export default function TryOnPage() {
  return (
    <Suspense fallback={<p className="p-10 text-muted-foreground">Loading try-on...</p>}>
      <TryOnPageInner />
    </Suspense>
  );
}
