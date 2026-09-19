"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  EmptyState,
  OrderRow,
  PanelHeader,
  SkeletonRows,
  StockRow,
} from "@/components/admin/ops-ui";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Order, Product, api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Package, ShoppingBag, TriangleAlert } from "lucide-react";

type Filter = "all" | "stock" | "orders";

export default function AlertsPage() {
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [pending, setPending] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    api<{ alerts: { lowStock: Product[]; pendingOrders: Order[] } }>("/api/admin/dashboard/alerts", {
      auth: true,
    })
      .then((data) => {
        setLowStock(data.alerts.lowStock);
        setPending(data.alerts.pendingOrders);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load alerts"))
      .finally(() => setLoading(false));
  }, []);

  const total = lowStock.length + pending.length;
  const showStock = filter !== "orders";
  const showOrders = filter !== "stock";

  const filters = useMemo(
    () =>
      [
        { id: "all" as const, label: "All", count: total },
        { id: "stock" as const, label: "Low stock", count: lowStock.length },
        { id: "orders" as const, label: "Needs attention", count: pending.length },
      ] as const,
    [lowStock.length, pending.length, total]
  );

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Alerts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Restock SKUs and move orders that are waiting on a decision.
          </p>
        </div>
        {!loading && (
          <p className="text-sm text-muted-foreground">
            {total === 0 ? "All clear" : `${total} open ${total === 1 ? "alert" : "alerts"}`}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              filter === item.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
            )}
          >
            {item.label}
            <span className="ml-1.5 tabular-nums opacity-80">{item.count}</span>
          </button>
        ))}
      </div>

      {!loading && total > 0 && filter === "all" && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <TriangleAlert className="h-4 w-4 shrink-0 text-amber-700" />
          {lowStock.length} {lowStock.length === 1 ? "product is" : "products are"} low, and {pending.length}{" "}
          {pending.length === 1 ? "order needs" : "orders need"} attention.
        </div>
      )}

      <div className={cn("mt-8 grid gap-6", showStock && showOrders ? "lg:grid-cols-2" : "grid-cols-1")}>
        {showStock && (
          <Card>
            <CardHeader>
              <PanelHeader
                title="Low stock"
                count={loading ? undefined : lowStock.length}
                href="/admin/products"
                hrefLabel="Catalog"
                tone={lowStock.length ? "warn" : "default"}
              />
            </CardHeader>
            <CardContent className="space-y-2">
              {loading && <SkeletonRows count={4} />}
              {!loading && lowStock.length === 0 && (
                <EmptyState
                  icon={Package}
                  title="Inventory looks healthy"
                  body="Every published product is above its restock threshold."
                />
              )}
              {!loading && lowStock.map((product) => <StockRow key={product.id} item={product} />)}
            </CardContent>
          </Card>
        )}

        {showOrders && (
          <Card>
            <CardHeader>
              <PanelHeader
                title="Needs attention"
                count={loading ? undefined : pending.length}
                href="/admin/orders"
                hrefLabel="Orders"
                tone={pending.length ? "warn" : "default"}
              />
            </CardHeader>
            <CardContent className="space-y-2">
              {loading && <SkeletonRows count={4} />}
              {!loading && pending.length === 0 && (
                <EmptyState
                  icon={ShoppingBag}
                  title="No pending orders"
                  body="Leads and unfulfilled orders will land here until they move."
                />
              )}
              {!loading && pending.map((order) => <OrderRow key={order.id} order={order} />)}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminShell>
  );
}
