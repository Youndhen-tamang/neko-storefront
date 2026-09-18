"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

type Draft = {
  name: string;
  description: string;
  category: string;
  tags: string[];
  suggested_price_range?: string;
};

export default function NewProductPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate(file: File) {
    setLoading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const data = await api<{ imageUrl: string; draft: Draft }>("/api/products/draft-from-image", {
        method: "POST",
        auth: true,
        body,
      });
      setImageUrl(data.imageUrl);
      setDraft(data.draft);
      toast.success("Draft generated from image");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate draft");
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    if (!draft || !imageUrl) return;
    setLoading(true);
    try {
      await api("/api/products", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          category: draft.category,
          tags: draft.tags,
          images: [imageUrl],
          priceCents: Math.round(Number(price) * 100),
          stock: Number(stock),
          status: "published",
          aiDraft: draft,
        }),
      });
      toast.success("Product published");
      router.push("/admin/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell>
      <h1 className="font-serif text-4xl">Add product from image</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Upload a photo. OpenRouter drafts the catalog copy. You set price and stock before publishing.
      </p>
      <div className="mt-8 max-w-2xl space-y-6 rounded-2xl border bg-card p-6">
        <div className="space-y-2">
          <Label>Product image</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void generate(file);
            }}
          />
        </div>
        {loading && <p className="text-sm text-muted-foreground">Working...</p>}
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Draft" className="h-56 w-full rounded-xl object-cover" />
        )}
        {draft && (
          <>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Suggested range</Label>
                <Input value={draft.suggested_price_range || ""} readOnly />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Price (USD)</Label>
                <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
              </div>
            </div>
            <Button onClick={confirm} disabled={loading || !price || !stock}>
              Confirm and publish
            </Button>
          </>
        )}
      </div>
    </AdminShell>
  );
}
