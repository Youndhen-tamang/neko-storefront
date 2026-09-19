"use client";

import Link from "next/link";
import { Banknote, CreditCard, Lock, MapPin, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EsewaButton } from "@/components/shop/esewa-button";
import { QuantityStepper } from "@/components/shop/quantity-stepper";
import { ShopShell } from "@/components/shop/shop-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, getAgencySlug } from "@/lib/api";
import { CartItem, getCart, removeFromCart, setCartItemQuantity } from "@/lib/cart";
import { money } from "@/lib/utils";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [loading, setLoading] = useState<"stripe" | "cod" | "esewa" | undefined>(undefined);

  function refresh() {
    setItems(getCart(getAgencySlug()));
  }

  useEffect(() => {
    refresh();
    window.addEventListener("cart-updated", refresh);
    return () => window.removeEventListener("cart-updated", refresh);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  function changeQuantity(productId: string, quantity: number) {
    setItems(setCartItemQuantity(getAgencySlug(), productId, quantity));
  }

  function removeItem(productId: string) {
    setItems(removeFromCart(getAgencySlug(), productId));
  }

  function validateCustomer() {
    if (!customerName.trim() || !customerEmail.trim() || !shippingAddress.trim()) {
      toast.error("Please add your name, email, and shipping location.");
      return false;
    }
    return true;
  }

  async function checkout(method: "stripe" | "cod") {
    if (!validateCustomer()) return;
    setLoading(method);
    try {
      const payload = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      };
      if (method === "cod") {
        const data = await api<{ order: { id: string } }>("/api/orders/cod", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        window.location.href = `/checkout/success?order_id=${data.order.id}`;
        return;
      }
      const data = await api<{ checkoutUrl: string }>("/api/orders/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      window.location.href = data.checkoutUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setLoading(undefined);
    }
  }

  return (
    <ShopShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Checkout</p>
          <h1 className="mt-2 font-serif text-4xl">Your bag</h1>
        </div>
        <Link href="/" className="text-sm text-muted-foreground underline">
          Continue shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-10 max-w-lg rounded-2xl border bg-card p-10 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 font-serif text-2xl">Your bag is empty</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a piece from the shop, then come back to review quantities and check out.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/">Browse the shop</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)]">
          <section aria-label="Cart items" className="min-w-0 space-y-4">
            <p className="text-sm text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
            <ul className="divide-y rounded-2xl border bg-card">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 p-4 sm:gap-5 sm:p-5">
                  <Link
                    href={`/products/${item.productId}`}
                    className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-24"
                  >
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-xs text-muted-foreground">
                        No image
                      </span>
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Link href={`/products/${item.productId}`} className="font-medium hover:underline">
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">{money(item.priceCents)} each</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <QuantityStepper
                          size="sm"
                          value={item.quantity}
                          min={0}
                          max={item.stock}
                          onChange={(quantity) => changeQuantity(item.productId, quantity)}
                        />
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                      {item.quantity >= item.stock && (
                        <p className="mt-2 text-xs text-muted-foreground">Only {item.stock} in stock</p>
                      )}
                    </div>
                    <p className="text-base font-medium tabular-nums sm:text-right">
                      {money(item.priceCents * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <aside className="lg:sticky lg:top-24">
            <form
              className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div>
                <h2 className="font-serif text-2xl">Order summary</h2>
                <p className="mt-1 text-sm text-muted-foreground">Review totals, then add shipping details.</p>
              </div>

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{money(total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="text-muted-foreground">Calculated next</dd>
                </div>
                <div className="flex justify-between border-t pt-3 text-base font-medium">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{money(total)}</dd>
                </div>
              </dl>

              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Shipping details</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-name">Full name</Label>
                  <Input
                    id="checkout-name"
                    autoComplete="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-email">Email</Label>
                  <Input
                    id="checkout-email"
                    type="email"
                    autoComplete="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-phone">Phone</Label>
                  <Input
                    id="checkout-phone"
                    type="tel"
                    autoComplete="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-address">Shipping address</Label>
                  <Textarea
                    id="checkout-address"
                    autoComplete="street-address"
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Button
                  className="w-full gap-2.5"
                  size="lg"
                  type="button"
                  disabled={loading === "cod"}
                  onClick={() => void checkout("cod")}
                >
                  <Banknote className="h-6 w-6 shrink-0" />
                  {loading === "cod" ? "Placing order..." : `Cash on delivery`}
                </Button>
                {/* Divider */}
  <div className="relative flex items-center py-1">
    <div className="flex-1 border-t" />
    <span className="mx-3 text-xs font-medium text-muted-foreground">
      OR
    </span>
    <div className="flex-1 border-t" />
  </div>
                <Button
                  className="w-full gap-2.5 bg-[#6057F7] text-white hover:bg-[#6057F7]/90 hover:text-white"
                  size="lg"
                  type="button"
                  variant="outline"
                  disabled={loading === "stripe"}
                  onClick={() => void checkout("stripe")}
                >
                  <CreditCard className="h-6 w-6 shrink-0" />
                  {loading === "stripe" ? "Redirecting to Stripe..." : `Pay with Stripe`}
                </Button>
                <EsewaButton
                  payload={{
                    customerName,
                    customerEmail,
                    customerPhone,
                    shippingAddress,
                    items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
                  }}
                  disabled={loading === "esewa"}
                  validate={validateCustomer}
                  onError={(message) => toast.error(message)}
                />
              </div>
     
              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Stripe and eSewa open a secure page where you complete the payment yourself. Cash on delivery is paid when the order arrives.
              </p>
            </form>
          </aside>
        </div>
      )}
    </ShopShell>
  );
}
