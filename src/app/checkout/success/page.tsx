"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { OrderConfirmed } from "@/components/shop/order-confirmed";
import { ShopShell } from "@/components/shop/shop-shell";
import { Order, api, getAgencySlug } from "@/lib/api";
import { saveCart } from "@/lib/cart";

function SuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const orderId = params.get("order_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(sessionId || orderId));

  useEffect(() => {
    if (!sessionId && !orderId) {
      setLoading(false);
      setError("Missing payment session.");
      return;
    }
    saveCart(getAgencySlug(), []);
    const request = orderId
      ? api<{ order: Order }>(`/api/orders/placed/${orderId}`)
      : api<{ order: Order }>("/api/orders/confirm", {
          method: "POST",
          body: JSON.stringify({ sessionId }),
        });
    request
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId, orderId]);

  return (
    <ShopShell>
      <OrderConfirmed order={order} error={error} loading={loading} />
    </ShopShell>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <ShopShell>
          <OrderConfirmed order={null} error="" loading />
        </ShopShell>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
