"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ShopShell } from "@/components/shop/shop-shell";
import { Order, api, getAgencySlug } from "@/lib/api";
import { saveCart } from "@/lib/cart";
import { money } from "@/lib/utils";

function SuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) return;
    saveCart(getAgencySlug(), []);
    api<{ order: Order }>("/api/orders/confirm", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    })
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message));
  }, [sessionId]);

  return (
    <ShopShell>
      <div className="mx-auto max-w-xl rounded-2xl border bg-card p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Order confirmed</p>
        <h1 className="mt-3 font-serif text-4xl">Thank you</h1>
        {error && <p className="mt-4 text-destructive">{error}</p>}
        {order && (
          <div className="mt-6 space-y-3">
            <p>Invoice {order.invoice_number}</p>
            <p>Status: {order.status}</p>
            <p>Total {money(order.total_cents)}</p>
            <p className="text-sm text-muted-foreground">
              A branded invoice email is sent once SMTP is configured.
            </p>
          </div>
        )}
      </div>
    </ShopShell>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessInner />
    </Suspense>
  );
}
