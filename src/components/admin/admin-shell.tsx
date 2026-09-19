"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  TriangleAlert,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { clearAdminToken, getAdminToken } from "@/lib/api";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/comments", label: "Comments", icon: Heart },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/alerts", label: "Alerts", icon: TriangleAlert },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function pageTitle(pathname: string) {
  if (pathname === "/admin/products/new") return "New product";
  if (pathname.startsWith("/admin/products/")) return "Edit product";
  const match = links.find((link) => isActive(pathname, link.href));
  return match?.label || "Admin";
}

function backHref(pathname: string) {
  if (pathname === "/admin") return "/";
  if (pathname === "/admin/products/new" || /^\/admin\/products\/[^/]+$/.test(pathname)) return "/admin/products";
  return "/admin";
}

function backLabel(pathname: string) {
  return pathname === "/admin" ? "Shop" : "Back";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const title = useMemo(() => pageTitle(pathname), [pathname]);

  useEffect(() => {
    if (!getAdminToken()) router.replace("/admin/login");
  }, [router]);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  function goBack() {
    router.push(backHref(pathname));
  }

  function signOut() {
    clearAdminToken();
    setLogoutOpen(false);
    router.push("/admin/login");
  }

  function Nav() {
    return (
      <nav className="flex flex-1 flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm",
              isActive(pathname, link.href) ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            <link.icon className="h-4 w-4 shrink-0" />
            {link.label}
          </Link>
        ))}
        <div className="mt-auto pt-3">
          <Button className="w-full" type="button" onClick={() => setLogoutOpen(true)}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </nav>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b bg-card/95 px-3 py-2.5 backdrop-blur lg:hidden">
        <Button type="button" variant="outline" size="icon" aria-label={backLabel(pathname)} onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Agency admin</p>
          <p className="truncate font-serif text-lg leading-tight">{title}</p>
        </div>
        <Button type="button" variant="outline" size="icon" aria-label="Open menu" onClick={() => setNavOpen(true)}>
          <Menu className="h-4 w-4" />
        </Button>
      </header>

      {navOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-foreground/40" aria-label="Close menu" onClick={() => setNavOpen(false)} />
          <aside className="relative flex h-full w-[min(18rem,86vw)] flex-col border-r bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Agency admin</p>
                <p className="mt-1 font-serif text-xl">Operations</p>
              </div>
              <Button type="button" variant="outline" size="icon" aria-label="Close menu" onClick={() => setNavOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Nav />
          </aside>
        </div>
      )}

      <aside className="hidden border-r bg-card lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:self-start lg:overflow-y-auto">
        <div className="px-5 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Agency admin</p>
          <p className="mt-1 font-serif text-xl">Operations</p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-3 pb-4">
          <Nav />
        </div>
      </aside>

      <div className="min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="mb-4 hidden lg:block">
          <Button type="button" variant="outline" size="sm" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel(pathname)}
          </Button>
        </div>
        <div className="min-w-0 [&_h1]:text-3xl sm:[&_h1]:text-4xl">{children}</div>
      </div>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>You will need to sign in again to manage this shop.</DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setLogoutOpen(false)}>
              Stay signed in
            </Button>
            <Button type="button" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
