"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Mode = "manual" | "ai";

type Draft = {
  name: string;
  description: string;
  category: string;
  tags: string[];
  suggested_price_range?: string;
};

export default function NewProductPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("manual");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [threshold, setThreshold] = useState("5");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [images, setImages] = useState<string[]>([]);
  const [suggestedRange, setSuggestedRange] = useState("");
  const [aiDraft, setAiDraft] = useState<Draft | null>(null);

  async function uploadManual(file: File) {
    setUploading(true);
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
    } finally {
      setUploading(false);
    }
  }

  async function generateFromImage(file: File) {
    setUploading(true);
    const body = new FormData();
    body.append("image", file);
    try {
      const data = await api<{ imageUrl: string; draft: Draft }>("/api/products/draft-from-image", {
        method: "POST",
        auth: true,
        body,
      });
      setImages((current) => [...current, data.imageUrl]);
      setName(data.draft.name || "");
      setDescription(data.draft.description || "");
      setCategory(data.draft.category || "");
      setTags((data.draft.tags || []).join(", "));
      setSuggestedRange(data.draft.suggested_price_range || "");
      setAiDraft(data.draft);
      toast.success("Draft generated from image");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate draft");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      await api("/api/products", {
        method: "POST",
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
          aiDraft: aiDraft ?? undefined,
        }),
      });
      toast.success(status === "published" ? "Product published" : "Draft saved");
      router.push("/admin/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save product");
    } finally {
      setSaving(false);
    }
  }

  const canSave = Boolean(name.trim() && images.length && price !== "" && stock !== "");

  return (
    <AdminShell>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Add product</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Enter catalog details yourself, or upload a photo and let AI draft the copy.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/products">Back</Link>
        </Button>
      </div>

      <div className="mt-6 inline-flex rounded-lg border bg-card p-1">
        <button
          type="button"
          className={cn(
            "rounded-md px-4 py-2 text-sm",
            mode === "manual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          )}
          onClick={() => setMode("manual")}
        >
          Manual
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md px-4 py-2 text-sm",
            mode === "ai" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          )}
          onClick={() => setMode("ai")}
        >
          AI from image
        </button>
      </div>

      <div className="mt-6 max-w-2xl space-y-6 rounded-2xl border bg-card p-6">
        <div className="space-y-2">
          <Label>{mode === "ai" ? "Product image (AI draft)" : "Product images"}</Label>
          <p className="text-xs text-muted-foreground">
            {mode === "ai"
              ? "Upload a photo. The catalog name, description, category, and tags are filled in for you to edit."
              : "Upload one or more photos, then fill in the product details yourself."}
          </p>
          <Input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (mode === "ai") void generateFromImage(file);
              else void uploadManual(file);
              e.target.value = "";
            }}
          />
          {uploading && (
            <p className="text-sm text-muted-foreground">
              {mode === "ai" ? "Generating draft from image..." : "Uploading image..."}
            </p>
          )}
          {images.length > 0 && (
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
          )}
        </div>

        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Silk slip dress" />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Fabric, fit, and who it is for."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Dresses" />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="silk, evening, minimal" />
          </div>
        </div>
        {mode === "ai" && suggestedRange && (
          <div className="space-y-2">
            <Label>Suggested price range</Label>
            <Input value={suggestedRange} readOnly />
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Price (USD)</Label>
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
        <Button onClick={save} disabled={saving || uploading || !canSave}>
          {saving ? "Saving..." : status === "published" ? "Save and publish" : "Save draft"}
        </Button>
      </div>
    </AdminShell>
  );
}
