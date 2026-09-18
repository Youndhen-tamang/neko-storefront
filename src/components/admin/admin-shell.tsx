"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LayoutDashboard, LogOut, Package, Settings, ShoppingBag, TriangleAlert } from "lucide-react";
import { clearAdminToken, getAdminToken } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/alerts", label: "Alerts", icon: TriangleAlert },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Branding", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!getAdminToken()) router.replace("/admin/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-muted/40 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b bg-card lg:border-b-0 lg:border-r">
        <div className="px-5 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Agency admin</p>
          <p className="mt-1 font-serif text-xl">Operations</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                pathname === link.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <button
            className="mt-auto flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground"
            onClick={() => {
              clearAdminToken();
              router.push("/admin/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </nav>
      </aside>
      <div className="p-6 lg:p-8">{children}</div>
    </div>
  );
}
