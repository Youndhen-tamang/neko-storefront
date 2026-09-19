import Link from "next/link";
import { XCircle } from "lucide-react";
import { ShopShell } from "@/components/shop/shop-shell";
import { Button } from "@/components/ui/button";

// eSewa sends the shopper here when a payment is cancelled or declined.
export default function EsewaFailedPage() {
  return (
    <ShopShell>
      <div className="mx-auto mt-10 max-w-lg rounded-2xl border bg-card p-10 text-center">
        <XCircle className="mx-auto h-10 w-10 text-destructive" />
        <h1 className="mt-4 font-serif text-3xl">Payment not completed</h1>
        <p className="mt-3 text-muted-foreground">
          Your eSewa payment was cancelled or did not go through. Nothing was charged and your bag is
          still saved.
        </p>
        <div className="mt-8 grid gap-3">
          <Button asChild size="lg">
            <Link href="/cart">Back to your bag</Link>
          </Button>
          <Link href="/" className="text-sm text-muted-foreground underline">
            Continue shopping
          </Link>
        </div>
      </div>
    </ShopShell>
  );
}
