import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bell,
  CheckCircle2,
  Heart,
  MessageSquare,
  Package,
  PackageX,
  ShoppingBag,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Order, Product } from "@/lib/api";
import { asStringArray, cn, money } from "@/lib/utils";

export const OPEN_ORDER_STATUSES = new Set(["lead", "ordered"]);

export type StockItem = {
  id: string;
  name: string;
  stock: number;
  low_stock_threshold?: number;
  images?: Product["images"];
  category?: string | null;
  status?: Product["status"];
};

export function stockLevel(stock: number, threshold = 5) {
  if (stock <= 0) return "out" as const;
  if (stock <= Math.max(1, Math.ceil(threshold / 2))) return "critical" as const;
  if (stock <= threshold) return "low" as const;
  return "ok" as const;
}

export function stockLabel(level: ReturnType<typeof stockLevel>) {
  if (level === "out") return "Out of stock";
  if (level === "critical") return "Critical";
  if (level === "low") return "Low";
  return "In stock";
}

export function formatWhen(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return date.toLocaleDateString("en-NP", { month: "short", day: "numeric" });
}

export function dayGroup(iso?: string | null) {
  if (!iso) return "Earlier";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Earlier";
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const then = new Date(date);
  then.setHours(0, 0, 0, 0);
  const days = Math.round((start.getTime() - then.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return "Earlier";
}

export function OrderStatusBadge({ status }: { status: string }) {
  const tone: Record<string, string> = {
    lead: "border-amber-300/80 bg-amber-50 text-amber-900",
    ordered: "border-primary/25 bg-primary/10 text-primary",
    dispatched: "border-sky-300/80 bg-sky-50 text-sky-900",
    delivered: "border-emerald-300/80 bg-emerald-50 text-emerald-900",
    cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
  };
  return <Badge className={cn("capitalize", tone[status] || "")}>{status}</Badge>;
}

function ProductThumb({ item }: { item: Pick<StockItem, "name" | "images"> }) {
  const src = asStringArray(item.images)[0];
  if (!src) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Package className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
  );
}

export function StockMeter({ stock, threshold = 5 }: { stock: number; threshold?: number }) {
  const level = stockLevel(stock, threshold);
  const cap = Math.max(threshold * 2, 1);
  const width = Math.min(100, (Math.max(stock, 0) / cap) * 100);
  const fill =
    level === "out" || level === "critical"
      ? "bg-destructive"
      : level === "low"
        ? "bg-amber-500"
        : "bg-primary";
  return (
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full", fill)} style={{ width: `${width}%` }} />
    </div>
  );
}

export function StockRow({ item }: { item: StockItem }) {
  const threshold = item.low_stock_threshold ?? 5;
  const level = stockLevel(item.stock, threshold);
  const tone =
    level === "out" || level === "critical"
      ? "border-destructive/20 bg-destructive/[0.04]"
      : "border-amber-200/80 bg-amber-50/60";

  return (
    <Link
      href={`/admin/products/${item.id}`}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors hover:bg-muted/60",
        tone
      )}
    >
      <ProductThumb item={item} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              {item.category || "Uncategorized"}
              {item.status ? ` · ${item.status}` : ""}
            </p>
          </div>
          <Badge
            className={
              level === "out" || level === "critical"
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-amber-300/80 bg-amber-50 text-amber-900"
            }
          >
            {stockLabel(level)}
          </Badge>
        </div>
        <StockMeter stock={item.stock} threshold={threshold} />
        <p className="mt-1 text-xs text-muted-foreground">
          {item.stock} left · restock below {threshold}
        </p>
      </div>
    </Link>
  );
}

export function OrderRow({
  order,
  href = "/admin/orders",
}: {
  order: {
    id: string;
    invoice_number: string;
    status: string;
    total_cents: number;
    customer_name?: string | null;
    customer_email?: string | null;
    created_at?: string;
    items?: Order["items"];
  };
  href?: string;
}) {
  const open = OPEN_ORDER_STATUSES.has(order.status);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors hover:bg-muted/60",
        open ? "border-amber-200/80 bg-amber-50/60" : "bg-card"
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
          open ? "bg-amber-100 text-amber-800" : "bg-muted text-muted-foreground"
        )}
      >
        <ShoppingBag className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{order.invoice_number}</p>
            <p className="truncate text-xs text-muted-foreground">
              {order.customer_name || "Customer"}
              {order.created_at ? ` · ${formatWhen(order.created_at)}` : ""}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 text-sm">
          <p className="truncate text-xs text-muted-foreground">
            {order.items?.length
              ? order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")
              : order.customer_email || "Needs fulfillment"}
          </p>
          <p className="shrink-0 font-medium">{money(order.total_cents)}</p>
        </div>
      </div>
    </Link>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Package;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mt-3 font-medium">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export function SkeletonRows({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-[4.5rem] animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}

export function PanelHeader({
  title,
  count,
  href,
  hrefLabel,
  tone = "default",
}: {
  title: string;
  count?: number;
  href?: string;
  hrefLabel?: string;
  tone?: "default" | "warn";
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <CardEyebrow tone={tone}>{title}</CardEyebrow>
        {typeof count === "number" && (
          <p className="mt-1 text-sm text-muted-foreground">
            {count} {count === 1 ? "item" : "items"}
          </p>
        )}
      </div>
      {href && hrefLabel && (
        <Link href={href} className="shrink-0 text-sm text-primary hover:underline">
          {hrefLabel}
        </Link>
      )}
    </div>
  );
}

function CardEyebrow({ children, tone }: { children: ReactNode; tone: "default" | "warn" }) {
  return (
    <h3 className="flex items-center gap-2 font-serif text-xl">
      {tone === "warn" && <TriangleAlert className="h-4 w-4 text-amber-600" />}
      {children}
    </h3>
  );
}

const notificationIcons: Record<string, typeof Bell> = {
  order: ShoppingBag,
  orders: ShoppingBag,
  low_stock: PackageX,
  stock: PackageX,
  alert: TriangleAlert,
  comment: MessageSquare,
  comments: MessageSquare,
  like: Heart,
  likes: Heart,
  payment: CheckCircle2,
};

export function notificationIcon(type: string) {
  const key = (type || "").toLowerCase();
  if (notificationIcons[key]) return notificationIcons[key];
  if (key.includes("stock")) return PackageX;
  if (key.includes("order") || key.includes("payment")) return ShoppingBag;
  if (key.includes("comment")) return MessageSquare;
  if (key.includes("like")) return Heart;
  if (key.includes("alert")) return TriangleAlert;
  return Bell;
}
