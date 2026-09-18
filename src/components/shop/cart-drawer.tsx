"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import { QuantityStepper } from "@/components/shop/quantity-stepper";
import { Button } from "@/components/ui/button";
import { getAgencySlug } from "@/lib/api";
import {
  CART_OPEN_EVENT,
  CartItem,
  getCart,
  removeFromCart,
  setCartItemQuantity,
} from "@/lib/cart";
import { money } from "@/lib/utils";

export function CartDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  function refresh() {
    setItems(getCart(getAgencySlug()));
  }

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    const onOpen = () => {
      if (pathname === "/cart") return;
      refresh();
      setOpen(true);
    };
    window.addEventListener("cart-updated", onUpdate);
    window.addEventListener(CART_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("cart-updated", onUpdate);
      window.removeEventListener(CART_OPEN_EVENT, onOpen);
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/cart") setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
      inert={!open}
    >
      <button
        type="button"
        aria-label="Close cart"
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your bag</p>
            <h2 id="cart-drawer-title" className="mt-1 font-serif text-2xl">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close cart"
            className="grid h-9 w-9 place-items-center rounded-md hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="grid flex-1 place-items-center px-8 text-center">
            <div>
              <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-4 font-medium">Your bag is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">Add a piece from the shop to see it here.</p>
              <Button className="mt-5" onClick={() => setOpen(false)}>
                Continue shopping
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3">
                  <Link
                    href={`/products/${item.productId}`}
                    className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-muted"
                    onClick={() => setOpen(false)}
                  >
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-[10px] text-muted-foreground">
                        No image
                      </span>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-medium leading-tight hover:underline"
                        onClick={() => setOpen(false)}
                      >
                        {item.name}
                      </Link>
                      <p className="shrink-0 text-sm tabular-nums">
                        {money(item.priceCents * item.quantity)}
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{money(item.priceCents)} each</p>
                    <div className="mt-2 flex items-center gap-3">
                      <QuantityStepper
                        size="sm"
                        value={item.quantity}
                        min={0}
                        max={item.stock}
                        onChange={(quantity) => setCartItemQuantity(getAgencySlug(), item.productId, quantity)}
                      />
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => removeFromCart(getAgencySlug(), item.productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t bg-card px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">{money(total)}</span>
              </div>
              <Button className="w-full" size="lg" asChild>
                <Link href="/cart" onClick={() => setOpen(false)}>
                  Go to checkout
                </Link>
              </Button>
              <button
                type="button"
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
