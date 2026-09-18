"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product, api } from "@/lib/api";
import { money } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  function load() {
    api<{ products: Product[] }>("/api/products", { auth: true })
      .then((data) => setProducts(data.products))
      .catch((error) => toast.error(error.message));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">Add from image</Link>
        </Button>
      </div>
      <div className="mt-8 rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{money(product.price_cents)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge>{product.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      await api(`/api/products/${product.id}`, { method: "DELETE", auth: true });
                      load();
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}
