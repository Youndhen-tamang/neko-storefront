"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { OrderConfirmed } from "@/components/shop/order-confirmed";
import { ShopShell } from "@/components/shop/shop-shell";
import { Order, api, getAgencySlug } from "@/lib/api";
import { saveCart } from "@/lib/cart";

// eSewa redirects here with ?data=<base64 JSON> after a payment.
function EsewaSuccessInner() {
  const params = useSearchParams();
  const data = params.get("data");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(data));

  useEffect(() => {
    if (!data) {
      setLoading(false);
      setError("Missing eSewa payment details.");
      return;
    }
    api<{ order: Order }>("/api/esewa/verify", {
      method: "POST",
      body: JSON.stringify({ data }),
    })
      .then((result) => {
        saveCart(getAgencySlug(), []);
        setOrder(result.order);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [data]);

  return (
    <ShopShell>
      <OrderConfirmed order={order} error={error} loading={loading} />
    </ShopShell>
  );
}

export default function EsewaSuccessPage() {
  return (
    <Suspense
      fallback={
        <ShopShell>
          <OrderConfirmed order={null} error="" loading />
        </ShopShell>
      }
    >
      <EsewaSuccessInner />
    </Suspense>
  );
}
