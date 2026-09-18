"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Analytics, api } from "@/lib/api";
import { money } from "@/lib/utils";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function BarList({
  items,
  valueLabel,
}: {
  items: { label: string; value: number; display: string }[];
  valueLabel?: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No data for this range.</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="truncate pr-3">{item.label}</span>
            <span className="shrink-0 text-muted-foreground">
              {item.display}
              {valueLabel ? ` ${valueLabel}` : ""}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [from, setFrom] = useState(isoDate(new Date(Date.now() - 29 * 86400000)));
  const [to, setTo] = useState(isoDate(new Date()));
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  function load(nextFrom = from, nextTo = to, nextStatus = status, nextCategory = category) {
    const params = new URLSearchParams({ from: nextFrom, to: nextTo });
    if (nextStatus) params.set("status", nextStatus);
    if (nextCategory) params.set("category", nextCategory);
    setLoading(true);
    api<{ analytics: Analytics }>(`/api/admin/dashboard/analytics?${params}`, { auth: true })
      .then((data) => setAnalytics(data.analytics))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function preset(days: number) {
    const nextTo = isoDate(new Date());
    const nextFrom = isoDate(new Date(Date.now() - (days - 1) * 86400000));
    setFrom(nextFrom);
    setTo(nextTo);
    load(nextFrom, nextTo, status, category);
  }

  return (
    <AdminShell>
      <h1 className="font-serif text-4xl">Analytics</h1>
      <p className="mt-2 text-muted-foreground">Revenue, orders, and catalog performance for this store.</p>
      <form
        className="mt-6 grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[repeat(4,minmax(0,1fr))_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="lead">Lead</option>
          <option value="ordered">Ordered</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {(analytics?.inventory.categories || []).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button className="h-10 rounded-md bg-primary px-4 text-sm text-primary-foreground" type="submit">
          Apply
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {[7, 30, 90].map((days) => (
          <button
            key={days}
            className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
            onClick={() => preset(days)}
            type="button"
          >
            Last {days} days
          </button>
        ))}
      </div>
      {loading && !analytics ? (
        <p className="mt-8 text-muted-foreground">Loading analytics...</p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {[
              ["Revenue", money(analytics?.summary.revenueCents ?? 0)],
              ["Orders", analytics?.summary.orderCount ?? 0],
              ["Paid orders", analytics?.summary.paidOrderCount ?? 0],
              ["Units sold", analytics?.summary.unitsSold ?? 0],
              ["Avg order", money(analytics?.summary.avgOrderCents ?? 0)],
            ].map(([label, value]) => (
              <Card key={String(label)}>
                <CardHeader>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <CardTitle>{value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {[
              ["Catalog", analytics?.inventory.total ?? 0],
              ["Published", analytics?.inventory.published ?? 0],
              ["Drafts", analytics?.inventory.draft ?? 0],
              ["Low stock", analytics?.inventory.lowStock ?? 0],
            ].map(([label, value]) => (
              <Card key={String(label)} className="p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-medium">{value}</p>
              </Card>
            ))}
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by day</CardTitle>
              </CardHeader>
              <CardContent>
                <BarList
                  items={(analytics?.revenueByDay || []).map((row) => ({
                    label: row.date,
                    value: row.revenueCents,
                    display: money(row.revenueCents),
                  }))}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Orders by status</CardTitle>
              </CardHeader>
              <CardContent>
                <BarList
                  items={(analytics?.ordersByStatus || []).map((row) => ({
                    label: row.status,
                    value: row.count,
                    display: `${row.count} · ${money(row.revenueCents)}`,
                  }))}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top products</CardTitle>
              </CardHeader>
              <CardContent>
                <BarList
                  items={(analytics?.topProducts || []).map((row) => ({
                    label: `${row.name} (${row.quantity})`,
                    value: row.revenueCents,
                    display: money(row.revenueCents),
                  }))}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sales by category</CardTitle>
              </CardHeader>
              <CardContent>
                <BarList
                  items={(analytics?.byCategory || []).map((row) => ({
                    label: row.category,
                    value: row.revenueCents,
                    display: money(row.revenueCents),
                  }))}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </AdminShell>
  );
}
