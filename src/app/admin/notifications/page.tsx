"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);

  function load() {
    api<{ notifications: Notification[] }>("/api/notifications", { auth: true }).then((data) =>
      setItems(data.notifications)
    );
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl">Notifications</h1>
        <Button
          variant="outline"
          onClick={async () => {
            await api("/api/notifications/read-all", { method: "POST", auth: true });
            toast.success("Marked all read");
            load();
          }}
        >
          Mark all read
        </Button>
      </div>
      <div className="mt-8 space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            className="block w-full rounded-xl border bg-card p-4 text-left"
            onClick={async () => {
              await api(`/api/notifications/${item.id}/read`, { method: "PATCH", auth: true });
              load();
            }}
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{item.title}</p>
              {!item.read && <span className="text-xs uppercase tracking-wide text-primary">New</span>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
          </button>
        ))}
      </div>
    </AdminShell>
  );
}
