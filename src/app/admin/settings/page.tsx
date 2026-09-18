"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

type Settings = {
  brand_name: string;
  tagline: string | null;
  primary_color: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    api<{ settings: Settings }>("/api/settings", { auth: true }).then((data) => setSettings(data.settings));
  }, []);

  if (!settings) {
    return (
      <AdminShell>
        <p>Loading branding...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <h1 className="font-serif text-4xl">Brand settings</h1>
      <p className="mt-2 text-muted-foreground">
        These values appear on the customer storefront, chatbot, and invoice emails.
      </p>
      <form
        className="mt-8 max-w-xl space-y-4 rounded-2xl border bg-card p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          await api("/api/settings", {
            method: "PATCH",
            auth: true,
            body: JSON.stringify({
              brandName: settings.brand_name,
              tagline: settings.tagline,
              primaryColor: settings.primary_color,
              email: settings.email,
              phone: settings.phone,
              address: settings.address,
            }),
          });
          toast.success("Branding saved");
        }}
      >
        {settings.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={settings.logo_url} alt="Logo" className="h-12 w-auto" />
        )}
        <div className="space-y-2">
          <Label>Logo</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const body = new FormData();
              body.append("logo", file);
              const data = await api<{ settings: Settings }>("/api/settings/logo", {
                method: "POST",
                auth: true,
                body,
              });
              setSettings(data.settings);
              toast.success("Logo updated");
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>Brand name</Label>
          <Input
            value={settings.brand_name}
            onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Tagline</Label>
          <Input
            value={settings.tagline || ""}
            onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Primary color</Label>
          <Input
            type="color"
            value={settings.primary_color}
            onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Support email</Label>
          <Input
            value={settings.email || ""}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            value={settings.phone || ""}
            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Textarea
            value={settings.address || ""}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
          />
        </div>
        <Button type="submit">Save branding</Button>
      </form>
    </AdminShell>
  );
}
