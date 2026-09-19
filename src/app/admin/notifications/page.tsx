"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { dayGroup, EmptyState, formatWhen, notificationIcon } from "@/components/admin/ops-ui";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Bell, Inbox } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};

type Filter = "all" | "unread";

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [marking, setMarking] = useState(false);

  function load() {
    return api<{ notifications: Notification[] }>("/api/notifications", { auth: true })
      .then((data) => setItems(data.notifications))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load notifications"));
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const unread = items.filter((item) => !item.read).length;
  const visible = filter === "unread" ? items.filter((item) => !item.read) : items;
  const groups = useMemo(() => {
    const buckets: { label: string; items: Notification[] }[] = [
      { label: "Today", items: [] },
      { label: "Yesterday", items: [] },
      { label: "Earlier", items: [] },
    ];
    for (const item of visible) {
      const label = dayGroup(item.created_at);
      buckets.find((bucket) => bucket.label === label)?.items.push(item);
    }
    return buckets.filter((bucket) => bucket.items.length > 0);
  }, [visible]);

  async function markRead(id: string) {
    const current = items.find((item) => item.id === id);
    if (!current || current.read) return;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    try {
      await api(`/api/notifications/${id}/read`, { method: "PATCH", auth: true });
      window.dispatchEvent(new Event("admin-badges"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not mark read");
      load();
    }
  }

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Loading activity…" : unread ? `${unread} unread` : "You are caught up"}
          </p>
        </div>
        <Button
          variant="outline"
          disabled={marking || unread === 0}
          onClick={async () => {
            setMarking(true);
            try {
              await api("/api/notifications/read-all", { method: "POST", auth: true });
              toast.success("Marked all read");
              await load();
              window.dispatchEvent(new Event("admin-badges"));
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Could not update");
            } finally {
              setMarking(false);
            }
          }}
        >
          {marking ? "Updating…" : "Mark all read"}
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            { id: "all", label: "All", count: items.length },
            { id: "unread", label: "Unread", count: unread },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              filter === item.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
            )}
          >
            {item.label}
            <span className="ml-1.5 tabular-nums opacity-80">{item.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-8">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div className="rounded-xl border bg-card">
            <EmptyState
              icon={filter === "unread" ? Inbox : Bell}
              title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
              body={
                filter === "unread"
                  ? "New stock and order activity will appear here."
                  : "Orders, restocks, and comments will collect in this inbox."
              }
            />
          </div>
        )}

        {groups.map((group) => (
          <section key={group.label}>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {group.label}
            </h2>
            <div className="space-y-2">
              {group.items.map((item) => {
                const Icon = notificationIcon(item.type);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      "block w-full rounded-xl border p-4 text-left transition-colors",
                      item.read ? "bg-card hover:bg-muted/40" : "border-primary/25 bg-primary/[0.06] hover:bg-primary/10"
                    )}
                    onClick={() => void markRead(item.id)}
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                          item.read ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className={cn("font-medium", !item.read && "text-foreground")}>{item.title}</p>
                          <div className="flex shrink-0 items-center gap-2">
                            {!item.read && (
                              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary-foreground">
                                New
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">{formatWhen(item.created_at)}</span>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </AdminShell>
  );
}
