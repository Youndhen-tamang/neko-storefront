"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order, api } from "@/lib/api";
import { money } from "@/lib/utils";

const statuses = ["lead", "ordered", "dispatched", "delivered", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  function load() {
    api<{ orders: Order[] }>("/api/orders", { auth: true })
      .then((data) => setOrders(data.orders))
      .catch((error) => toast.error(error.message));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminShell>
      <h1 className="font-serif text-4xl">Orders</h1>
      <p className="mt-2 text-muted-foreground">Label each order as lead, ordered, dispatched, delivered, or cancelled.</p>
      <div className="mt-8 rounded-xl border bg-card">
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
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div>{order.invoice_number}</div>
                  <div className="text-xs text-muted-foreground">
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
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={async () => {
                          await api(`/api/orders/${order.id}/status`, {
                            method: "PATCH",
                            auth: true,
                            body: JSON.stringify({ status }),
                          });
                          toast.success(`Marked ${status}`);
                          load();
                        }}
                      >
                        <Badge className={order.status === status ? "bg-primary text-primary-foreground" : ""}>
                          {status}
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
