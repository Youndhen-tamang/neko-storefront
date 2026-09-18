"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product, api } from "@/lib/api";
import { money } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    const query = params.toString();
    setLoading(true);
    api<{ products: Product[] }>(`/api/products${query ? `?${query}` : ""}`, { auth: true })
      .then((data) => setProducts(data.products))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, status]);

  const categories = useMemo(
    () =>
      [...new Set(products.map((product) => product.category).filter((value): value is string => Boolean(value)))].sort(),
    [products]
  );

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit catalog copy, pricing, stock, and visibility.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Add product</Link>
        </Button>
      </div>
      <form
        className="mt-6 grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_180px_160px_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <Input
          placeholder="Search name, description, category"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>
      <div className="mt-6 rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground">
                  Loading products...
                </TableCell>
              </TableRow>
            )}
            {!loading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground">
                  No products match these filters.
                </TableCell>
              </TableRow>
            )}
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="font-medium">{product.name}</div>
                  <div className="mt-1 line-clamp-2 max-w-md text-xs text-muted-foreground">
                    {product.description || "No description"}
                  </div>
                </TableCell>
                <TableCell>{product.category || "—"}</TableCell>
                <TableCell>{money(product.price_cents)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.like_count ?? 0}</TableCell>
                <TableCell>{product.comment_count ?? 0}</TableCell>
                <TableCell>
                  <Badge>{product.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/products/${product.id}`}>Edit</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
                        try {
                          await api(`/api/products/${product.id}`, { method: "DELETE", auth: true });
                          toast.success("Product deleted");
                          load();
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Could not delete");
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}
