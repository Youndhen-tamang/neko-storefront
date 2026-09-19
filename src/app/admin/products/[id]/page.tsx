"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product, ProductEngagement, api } from "@/lib/api";
import { asStringArray } from "@/lib/utils";
import { AdminCommentThread } from "@/components/admin/comment-thread";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [threshold, setThreshold] = useState("5");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [images, setImages] = useState<string[]>([]);
  const [engagement, setEngagement] = useState<ProductEngagement | null>(null);

  function loadEngagement() {
    api<{ engagement: ProductEngagement }>(`/api/engagement/products/${params.id}`, { auth: true })
      .then((data) => setEngagement(data.engagement))
      .catch(() => undefined);
  }

  useEffect(() => {
    api<{ product: Product }>(`/api/products/${params.id}`, { auth: true })
      .then(({ product }) => {
        setName(product.name);
        setDescription(product.description || "");
        setCategory(product.category || "");
        setTags(asStringArray(product.tags).join(", "));
        setPrice(((product.price_cents || 0) / 100).toFixed(2));
        setStock(String(product.stock ?? 0));
        setThreshold(String(product.low_stock_threshold ?? 5));
        setStatus(product.status);
        setImages(asStringArray(product.images));
        loadEngagement();
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function save() {
    setSaving(true);
    try {
      await api(`/api/products/${params.id}`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({
          name,
          description,
          category,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          images,
          priceCents: Math.round(Number(price) * 100),
          stock: Number(stock),
          lowStockThreshold: Number(threshold),
          status,
        }),
      });
      toast.success("Product updated");
      router.push("/admin/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save product");
    } finally {
      setSaving(false);
    }
  }

  async function upload(file: File) {
    const body = new FormData();
    body.append("image", file);
    try {
      const data = await api<{ imageUrl: string }>("/api/products/upload-image", {
        method: "POST",
        auth: true,
        body,
      });
      setImages((current) => [...current, data.imageUrl]);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload image");
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <p className="text-muted-foreground">Loading product...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Edit product</h1>
          <p className="mt-1 text-sm text-muted-foreground">Update description, category, images, price, and stock.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/products">Back</Link>
        </Button>
      </div>
      <div className="mt-8 max-w-2xl space-y-6 rounded-2xl border bg-card p-6">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="cotton, summer, casual" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Price (NPR)</Label>
            <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Stock</Label>
            <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Low-stock alert</Label>
            <Input type="number" min="0" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <select
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="space-y-3">
          <Label>Images</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image) => (
              <div key={image} className="relative overflow-hidden rounded-xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="h-32 w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-2 top-2 rounded bg-background/90 px-2 py-1 text-xs"
                  onClick={() => setImages((current) => current.filter((item) => item !== image))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={save} disabled={saving || !name || images.length === 0}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;
              try {
                await api(`/api/products/${params.id}`, { method: "DELETE", auth: true });
                toast.success("Product deleted");
                router.push("/admin/products");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not delete");
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>
      {engagement && (
        <div className="mt-8 max-w-2xl space-y-4 rounded-2xl border bg-card p-6">
          <div>
            <h2 className="font-serif text-2xl">Likes & comments</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {engagement.likeCount} likes · {engagement.commentCount} comments
            </p>
          </div>
          <AdminCommentThread comments={engagement.comments} onDeleted={loadEngagement} />
        </div>
      )}
    </AdminShell>
  );
}
