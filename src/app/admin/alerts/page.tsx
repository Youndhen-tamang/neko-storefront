"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Order, Product } from "@/lib/api";

export default function AlertsPage() {
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [pending, setPending] = useState<Order[]>([]);

  useEffect(() => {
    api<{ alerts: { lowStock: Product[]; pendingOrders: Order[] } }>("/api/admin/dashboard/alerts", {
      auth: true,
    }).then((data) => {
      setLowStock(data.alerts.lowStock);
      setPending(data.alerts.pendingOrders);
    });
  }, []);

  return (
    <AdminShell>
      <h1 className="font-serif text-4xl">Alerts</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.length === 0 && <p className="text-sm text-muted-foreground">Inventory looks healthy.</p>}
            {lowStock.map((product) => (
              <p key={product.id}>
                {product.name} · {product.stock} left
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.length === 0 && <p className="text-sm text-muted-foreground">No pending orders.</p>}
            {pending.map((order) => (
              <p key={order.id}>
                {order.invoice_number} · {order.status}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
