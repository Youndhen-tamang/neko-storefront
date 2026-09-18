"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { money } from "@/lib/utils";

type Stats = {
  productCount: number;
  orderCount: number;
  revenueCents: number;
  unreadNotifications: number;
  lowStock: { id: string; name: string; stock: number }[];
  recentOrders: { id: string; invoice_number: string; status: string; total_cents: number }[];
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api<{ stats: Stats }>("/api/admin/dashboard", { auth: true })
      .then((data) => setStats(data.stats))
      .catch(() => undefined);
  }, []);

  return (
    <AdminShell>
      <div className="flex items-end justify-between gap-3">
        <h1 className="font-serif text-4xl">Dashboard</h1>
        <Link href="/admin/analytics" className="text-sm text-primary">
          Open analytics
        </Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          ["Products", stats?.productCount ?? 0],
          ["Orders", stats?.orderCount ?? 0],
          ["Revenue", money(stats?.revenueCents ?? 0)],
          ["Unread", stats?.unreadNotifications ?? 0],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader>
              <p className="text-sm text-muted-foreground">{label}</p>
              <CardTitle>{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(stats?.lowStock || []).length === 0 && (
              <p className="text-sm text-muted-foreground">No low-stock alerts.</p>
            )}
            {stats?.lowStock.map((item) => (
              <p key={item.id} className="text-sm">
                {item.name} · {item.stock} left
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats?.recentOrders.map((order) => (
              <p key={order.id} className="text-sm">
                {order.invoice_number} · {order.status} · {money(order.total_cents)}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
