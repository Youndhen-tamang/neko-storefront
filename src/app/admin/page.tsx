"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  Heart,
  MessageSquare,
  Package,
  ShoppingBag,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  EmptyState,
  OPEN_ORDER_STATUSES,
  OrderRow,
  PanelHeader,
  SkeletonRows,
  StockRow,
  type StockItem,
} from "@/components/admin/ops-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order, api } from "@/lib/api";
import { cn, money } from "@/lib/utils";

type Stats = {
  productCount: number;
  orderCount: number;
  revenueCents: number;
  unreadNotifications: number;
  likeCount?: number;
  commentCount?: number;
  lowStock: StockItem[];
  recentOrders: (Pick<Order, "id" | "invoice_number" | "status" | "total_cents"> &
    Partial<Pick<Order, "customer_name" | "created_at" | "items">>)[];
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [lowStock, setLowStock] = useState<StockItem[]>([]);
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<{ stats: Stats }>("/api/admin/dashboard", { auth: true }),
      api<{ alerts: { lowStock: StockItem[]; pendingOrders: Order[] } }>("/api/admin/dashboard/alerts", {
        auth: true,
      }),
    ])
      .then(([dash, alerts]) => {
        setStats(dash.stats);
        setLowStock(alerts.alerts.lowStock?.length ? alerts.alerts.lowStock : dash.stats.lowStock || []);
        setOpenOrders(alerts.alerts.pendingOrders || []);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const recentFallback = (stats?.recentOrders || []).filter((order) => OPEN_ORDER_STATUSES.has(order.status));
  const orders = openOrders.length ? openOrders : recentFallback;
  const attention = lowStock.length + orders.length;

  const kpis = [
    { label: "Products", value: stats?.productCount ?? 0, icon: Package, href: "/admin/products" },
    { label: "Orders", value: stats?.orderCount ?? 0, icon: ShoppingBag, href: "/admin/orders" },
    { label: "Revenue", value: money(stats?.revenueCents ?? 0), icon: Wallet, href: "/admin/analytics" },
    {
      label: "Unread",
      value: stats?.unreadNotifications ?? 0,
      icon: Bell,
      href: "/admin/notifications",
      warn: (stats?.unreadNotifications ?? 0) > 0,
    },
    { label: "Likes", value: stats?.likeCount ?? 0, icon: Heart, href: "/admin/comments" },
    { label: "Comments", value: stats?.commentCount ?? 0, icon: MessageSquare, href: "/admin/comments" },
  ];

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Low stock and open orders sit here until they are handled.
          </p>
        </div>
        <Link href="/admin/alerts" className="text-sm text-primary hover:underline">
          Open alerts
        </Link>
      </div>

      {attention > 0 && (
        <Link
          href="/admin/alerts"
          className="mt-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950"
        >
          <TriangleAlert className="h-5 w-5 shrink-0 text-amber-700" />
          <span className="min-w-0 flex-1 text-sm">
            <span className="font-medium">
              {lowStock.length} low-stock {lowStock.length === 1 ? "item" : "items"}
            </span>
            {" · "}
            {orders.length} {orders.length === 1 ? "order needs" : "orders need"} attention
          </span>
          <span className="shrink-0 text-sm font-medium">Review</span>
        </Link>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className={cn("h-full transition-colors hover:bg-muted/40", item.warn && "border-primary/30")}>
              <CardHeader className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <item.icon className={cn("h-4 w-4", item.warn ? "text-primary" : "text-muted-foreground")} />
                </div>
                <CardTitle className="text-2xl">{loading ? "—" : item.value}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <PanelHeader
              title="Low stock"
              count={loading ? undefined : lowStock.length}
              href="/admin/alerts"
              hrefLabel="View alerts"
              tone={lowStock.length ? "warn" : "default"}
            />
          </CardHeader>
          <CardContent className="space-y-2">
            {loading && <SkeletonRows />}
            {!loading && lowStock.length === 0 && (
              <EmptyState
                icon={Package}
                title="Inventory looks healthy"
                body="No SKUs are at or below their restock threshold."
              />
            )}
            {!loading &&
              lowStock.slice(0, 6).map((item) => <StockRow key={item.id} item={item} />)}
            {!loading && lowStock.length > 6 && (
              <Link href="/admin/alerts" className="block pt-1 text-center text-sm text-primary hover:underline">
                {lowStock.length - 6} more on alerts
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <PanelHeader
              title={openOrders.length ? "Open orders" : "Recent orders"}
              count={loading ? undefined : orders.length || stats?.recentOrders.length}
              href="/admin/orders"
              hrefLabel="View orders"
              tone={orders.length ? "warn" : "default"}
            />
          </CardHeader>
          <CardContent className="space-y-2">
            {loading && <SkeletonRows />}
            {!loading && orders.length === 0 && (stats?.recentOrders.length ?? 0) === 0 && (
              <EmptyState
                icon={ShoppingBag}
                title="No orders yet"
                body="New leads and unfulfilled orders will show up here."
              />
            )}
            {!loading &&
              (orders.length ? orders : stats?.recentOrders || [])
                .slice(0, 6)
                .map((order) => <OrderRow key={order.id} order={order} />)}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
