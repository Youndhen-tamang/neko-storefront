"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShopShell } from "@/components/shop/shop-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, getAgencySlug } from "@/lib/api";
import { CartItem, getCart, saveCart } from "@/lib/cart";
import { money } from "@/lib/utils";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(getCart(getAgencySlug()));
  }, []);

  const total = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  async function checkout() {
    setLoading(true);
    try {
      const data = await api<{ checkoutUrl: string }>("/api/orders/checkout", {
        method: "POST",
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });
      window.location.href = data.checkoutUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ShopShell>
      <h1 className="font-serif text-4xl">Cart</h1>
      {items.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          Your cart is empty. <Link href="/">Continue shopping</Link>
        </p>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between rounded-xl border bg-card p-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {money(item.priceCents)} · qty {item.quantity}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    const next = items.filter((row) => row.productId !== item.productId);
                    setItems(next);
                    saveCart(getAgencySlug(), next);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <form
            className="space-y-4 rounded-2xl border bg-card p-6"
            onSubmit={(e) => {
              e.preventDefault();
              void checkout();
            }}
          >
            <h2 className="font-serif text-2xl">Checkout</h2>
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Shipping address</Label>
              <Textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} required />
            </div>
            <p className="text-lg font-medium">Total {money(total)}</p>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Redirecting to Stripe..." : "Pay with Stripe"}
            </Button>
          </form>
        </div>
      )}
    </ShopShell>
  );
}
