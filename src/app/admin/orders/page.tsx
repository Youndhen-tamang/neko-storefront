"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order, api } from "@/lib/api";
import { money } from "@/lib/utils";

const statuses = ["lead", "ordered", "dispatched", "delivered", "cancelled"];

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

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
    api<{ orders: Order[] }>(`/api/orders${query ? `?${query}` : ""}`, { auth: true })
      .then((data) => setOrders(data.orders))
      .catch((error) => toast.error(error.message));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <AdminShell>
      <h1 className="font-serif text-4xl">Orders</h1>
      <p className="mt-2 text-muted-foreground">Filter by customer, date, or status, then update fulfillment labels.</p>
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
      <div className="mt-3 flex flex-wrap gap-2">
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
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No orders match these filters.
                </TableCell>
              </TableRow>
            )}
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div>{order.invoice_number}</div>
                  <div className="text-xs text-muted-foreground">
                    {order.payment_method === "cod" ? "Cash on delivery · " : "Stripe · "}
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
                        onClick={async () => {
                          await api(`/api/orders/${order.id}/status`, {
                            method: "PATCH",
                            auth: true,
                            body: JSON.stringify({ status: item }),
                          });
                          toast.success(`Marked ${item}`);
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
