"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order, api } from "@/lib/api";
import { cn, money, paymentMethodLabel } from "@/lib/utils";

const statuses = ["lead", "ordered", "dispatched", "delivered", "cancelled"];

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

type Filter = "all" | "unread";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [marking, setMarking] = useState(false);

  function load(next?: { q?: string; status?: string; from?: string; to?: string }) {
    const nextQ = next?.q ?? q;
    const nextStatus = next?.status ?? status;
    const nextFrom = next?.from ?? from;
    const nextTo = next?.to ?? to;
    const params = new URLSearchParams();
    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextStatus) params.set("status", nextStatus);
    if (nextFrom) params.set("from", nextFrom);
    if (nextTo) params.set("to", nextTo);
    const query = params.toString();
    return api<{ orders: Order[]; unreadCount?: number }>(`/api/orders${query ? `?${query}` : ""}`, { auth: true })
      .then((data) => setOrders(data.orders))
      .catch((error) => toast.error(error.message));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const unread = orders.filter((order) => !order.read).length;
  const visible = filter === "unread" ? orders.filter((order) => !order.read) : orders;

  async function markRead(id: string) {
    const current = orders.find((order) => order.id === id);
    if (!current || current.read) return;
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, read: true } : order)));
    try {
      await api(`/api/orders/${id}/read`, { method: "PATCH", auth: true });
      window.dispatchEvent(new Event("admin-badges"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not mark read");
      load();
    }
  }

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Orders</h1>
          <p className="mt-2 text-muted-foreground">
            {unread ? `${unread} new ${unread === 1 ? "order" : "orders"} to review` : "Filter by customer, date, or status, then update fulfillment labels."}
          </p>
        </div>
        <Button
          variant="outline"
          disabled={marking || unread === 0}
          onClick={async () => {
            setMarking(true);
            try {
              await api("/api/orders/read-all", { method: "POST", auth: true });
              toast.success("Marked all read");
              await load();
              window.dispatchEvent(new Event("admin-badges"));
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Could not update");
            } finally {
              setMarking(false);
            }
          }}
        >
          {marking ? "Updating…" : "Mark all read"}
        </Button>
      </div>
      <form
        className="mt-6 grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_160px_160px_160px_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <Input placeholder="Search invoice, name, or email" value={q} onChange={(e) => setQ(e.target.value)} />
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(
          [
            { id: "all", label: "All", count: orders.length },
            { id: "unread", label: "New", count: unread },
          ] as const
        ).map((item) => (
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
        <button
          type="button"
          className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
          onClick={() => {
            const nextFrom = isoDate(new Date(Date.now() - 6 * 86400000));
            const nextTo = isoDate(new Date());
            setFrom(nextFrom);
            setTo(nextTo);
            load({ from: nextFrom, to: nextTo });
          }}
        >
          Last 7 days
        </button>
        <button
          type="button"
          className="text-xs text-muted-foreground underline"
          onClick={() => {
            setQ("");
            setStatus("");
            setFrom("");
            setTo("");
            setFilter("all");
            load({ q: "", status: "", from: "", to: "" });
          }}
        >
          Clear filters
        </button>
      </div>
      <div className="mt-6 rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Label</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  {filter === "unread" ? "No new orders to review." : "No orders match these filters."}
                </TableCell>
              </TableRow>
            )}
            {visible.map((order) => (
              <TableRow
                key={order.id}
                className={cn("cursor-pointer", !order.read && "bg-primary/[0.06] hover:bg-primary/10")}
                onClick={() => void markRead(order.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{order.invoice_number}</span>
                    {!order.read && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary-foreground">
                        New
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {paymentMethodLabel(order.payment_method)}{" · "}
                    {order.items?.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
                  </div>
                </TableCell>
                <TableCell>
                  {order.customer_name}
                  <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                </TableCell>
                <TableCell>{money(order.total_cents)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={async (event) => {
                          event.stopPropagation();
                          await api(`/api/orders/${order.id}/status`, {
                            method: "PATCH",
                            auth: true,
                            body: JSON.stringify({ status: item }),
                          });
                          toast.success(`Marked ${item}`);
                          await markRead(order.id);
                          window.dispatchEvent(new Event("admin-badges"));
                          load();
                        }}
                      >
                        <Badge className={order.status === item ? "bg-primary text-primary-foreground" : ""}>
                          {item}
                        </Badge>
                      </button>
                    ))}
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
