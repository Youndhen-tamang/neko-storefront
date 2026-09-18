"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ShopShell } from "@/components/shop/shop-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product, api, getAgencySlug } from "@/lib/api";
import { addToCart } from "@/lib/cart";
import { asStringArray, money } from "@/lib/utils";

type TryOnResult = {
  id: string;
  resultUrl: string;
  sizeHint: string;
  product: { id: string; name: string; price_cents: number; images: unknown; stock: number };
};

type HeightUnit = "cm" | "in";
type WeightUnit = "kg" | "lb";

function toCm(value: number, unit: HeightUnit) {
  return unit === "cm" ? value : value * 2.54;
}

function toKg(value: number, unit: WeightUnit) {
  return unit === "kg" ? value : value * 0.453592;
}

function UnitToggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border text-xs">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={
            option === value
              ? "bg-primary px-3 py-1.5 text-primary-foreground"
              : "px-3 py-1.5 text-muted-foreground hover:bg-muted"
          }
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function TryOnInner() {
  const params = useSearchParams();
  const router = useRouter();
  const requestedProduct = params.get("product") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState(requestedProduct);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TryOnResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<{ products: Product[] }>("/api/products/public")
      .then((data) => {
        setProducts(data.products);
        if (!requestedProduct && data.products[0]) setProductId(data.products[0].id);
      })
      .catch((error) => toast.error(error.message));
  }, [requestedProduct]);

  useEffect(() => {
    if (!photo) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const product = useMemo(() => products.find((item) => item.id === productId) ?? null, [products, productId]);
  const productImage = product ? asStringArray(product.images)[0] : undefined;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!photo) return toast.error("Add a full-body photo first");
    if (!product) return toast.error("Pick a product to try on");
    const heightCm = toCm(Number(height), heightUnit);
    const weightKg = toKg(Number(weight), weightUnit);
    if (!heightCm || heightCm < 100 || heightCm > 230) return toast.error("Enter a height between 100 and 230 cm");
    if (!weightKg || weightKg < 30 || weightKg > 250) return toast.error("Enter a weight between 30 and 250 kg");

    const body = new FormData();
    body.append("photo", photo);
    body.append("productId", product.id);
    body.append("heightCm", String(Math.round(heightCm)));
    body.append("weightKg", String(Math.round(weightKg)));

    setLoading(true);
    try {
      const data = await api<{ session: TryOnResult }>("/api/tryon", { method: "POST", body });
      setResult(data.session);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Try-on failed");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (result) {
    const resultProduct = products.find((item) => item.id === result.product.id) ?? null;
    return (
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.resultUrl} alt={`You wearing ${result.product.name}`} className="w-full object-cover" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Your look</p>
          <h1 className="mt-2 font-serif text-4xl">{result.product.name}</h1>
          <p className="mt-3 text-2xl">{money(result.product.price_cents)}</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
            <span className="font-medium">Suggested size: {result.sizeHint}</span>
            <span className="text-muted-foreground">general estimate</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            This is an AI rendering based on your photo and measurements. Colour and fit are approximate.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              disabled={result.product.stock < 1}
              onClick={() => {
                addToCart(getAgencySlug(), resultProduct ?? { ...result.product, images: result.product.images });
                toast.success("Added to cart");
              }}
            >
              Add to cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={result.product.stock < 1}
              onClick={() => {
                addToCart(getAgencySlug(), resultProduct ?? { ...result.product, images: result.product.images });
                router.push("/cart");
              }}
            >
              Buy now
            </Button>
            <Button size="lg" variant="ghost" onClick={reset}>
              Try another photo
            </Button>
          </div>
          <Link href={`/products/${result.product.id}`} className="mt-6 inline-block text-sm underline">
            View product details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Virtual try-on</p>
        <h1 className="mt-2 font-serif text-5xl">See it on you</h1>
        <p className="mt-4 max-w-lg leading-7 text-muted-foreground">
          Upload a full-body photo, tell us your height and weight, and we&apos;ll show you how the piece looks on you
          along with a suggested size.
        </p>

        <form className="mt-8 space-y-6 rounded-2xl border bg-card p-6" onSubmit={submit}>
          <div className="space-y-2">
            <Label>Product</Label>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              {products.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {money(item.price_cents)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Full-body photo</Label>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            />
            <label className="inline-flex cursor-pointer items-center text-sm text-muted-foreground underline">
              Or take a photo now
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              />
            </label>
            <p className="text-xs text-muted-foreground">
              Stand straight, facing the camera, in good light. Your photo is used only to render this preview.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Height</Label>
                <UnitToggle value={heightUnit} options={["cm", "in"]} onChange={setHeightUnit} />
              </div>
              <Input
                type="number"
                inputMode="decimal"
                min={heightUnit === "cm" ? 100 : 39}
                max={heightUnit === "cm" ? 230 : 91}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={heightUnit === "cm" ? "165" : "65"}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Weight</Label>
                <UnitToggle value={weightUnit} options={["kg", "lb"]} onChange={setWeightUnit} />
              </div>
              <Input
                type="number"
                inputMode="decimal"
                min={weightUnit === "kg" ? 30 : 66}
                max={weightUnit === "kg" ? 250 : 551}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={weightUnit === "kg" ? "60" : "132"}
              />
            </div>
          </div>

          <Button type="submit" size="lg" disabled={loading || !products.length}>
            {loading ? "Generating your look…" : "Show me wearing it"}
          </Button>
          {loading && (
            <p className="text-xs text-muted-foreground">This usually takes about 30 seconds. Please keep this page open.</p>
          )}
        </form>
      </div>

      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl bg-muted">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Your photo" className="w-full object-cover" />
          ) : productImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={productImage} alt={product?.name ?? "Product"} className="w-full object-cover" />
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center text-sm text-muted-foreground">
              Your photo preview appears here
            </div>
          )}
        </div>
        {product && (
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{product.category}</p>
            <p className="mt-1 font-serif text-2xl">{product.name}</p>
            <p className="mt-1">{money(product.price_cents)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TryOnPage() {
  return (
    <ShopShell>
      <Suspense fallback={<p>Loading try-on…</p>}>
        <TryOnInner />
      </Suspense>
    </ShopShell>
  );
}
