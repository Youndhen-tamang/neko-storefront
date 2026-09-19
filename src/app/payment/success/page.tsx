"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
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
  // React runs effects twice in development; verify must only be sent once per page load.
  const verified = useRef<string | null>(null);

  useEffect(() => {
    if (!data) {
      setLoading(false);
      setError("Missing eSewa payment details.");
      return;
    }
    if (verified.current === data) return;
    verified.current = data;
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
