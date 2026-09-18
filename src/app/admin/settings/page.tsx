"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

type WhatsAppSettings = {
  enabled: boolean;
  phoneNumberId: string;
  displayPhone: string;
  hasAccessToken: boolean;
  accessTokenLast4: string | null;
  webhookUrl: string;
  verifyTokenConfigured: boolean;
};

function WhatsAppCard() {
  const [wa, setWa] = useState<WhatsAppSettings | null>(null);
  const [accessToken, setAccessToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    api<{ whatsapp: WhatsAppSettings }>("/api/settings/whatsapp", { auth: true })
      .then((data) => setWa(data.whatsapp))
      .catch((error) => toast.error(error.message));
  }, []);

  if (!wa) return null;

  return (
    <form
      className="mt-8 max-w-xl space-y-4 rounded-2xl border bg-card p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
          const data = await api<{ whatsapp: WhatsAppSettings }>("/api/settings/whatsapp", {
            method: "PUT",
            auth: true,
            body: JSON.stringify({
              enabled: wa.enabled,
              phoneNumberId: wa.phoneNumberId,
              displayPhone: wa.displayPhone,
              ...(accessToken.trim() ? { accessToken: accessToken.trim() } : {}),
            }),
          });
          setWa(data.whatsapp);
          setAccessToken("");
          toast.success("WhatsApp settings saved");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not save");
        } finally {
          setSaving(false);
        }
      }}
    >
      <div>
        <h2 className="font-serif text-2xl">WhatsApp assistant</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Customers who message your WhatsApp number get the same assistant as the storefront chat: product help,
          photo matching, try-on links, and payment links.
        </p>
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={wa.enabled}
          onChange={(e) => setWa({ ...wa, enabled: e.target.checked })}
        />
        Enable WhatsApp auto-replies
      </label>
      <div className="space-y-2">
        <Label>Phone number ID</Label>
        <Input
          value={wa.phoneNumberId}
          placeholder="From Meta → WhatsApp → API setup"
          onChange={(e) => setWa({ ...wa, phoneNumberId: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Access token</Label>
        <Input
          type="password"
          autoComplete="off"
          value={accessToken}
          placeholder={wa.hasAccessToken ? `Saved (…${wa.accessTokenLast4 ?? ""}). Paste a new one to replace.` : "Permanent system-user token"}
          onChange={(e) => setAccessToken(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Display phone (optional)</Label>
        <Input
          value={wa.displayPhone}
          placeholder="+1 555 000 0000"
          onChange={(e) => setWa({ ...wa, displayPhone: e.target.value })}
        />
      </div>
      <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
        <p>
          Webhook callback URL: <code className="select-all">{wa.webhookUrl}</code>
        </p>
        <p className="mt-1">
          {wa.verifyTokenConfigured
            ? "Verify token is set on the platform. Ask your platform admin for it when configuring Meta."
            : "The platform has not set WHATSAPP_VERIFY_TOKEN yet; webhook verification will fail until it does."}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save WhatsApp"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={testing || !wa.hasAccessToken}
          onClick={async () => {
            setTesting(true);
            try {
              const data = await api<{ displayPhoneNumber: string | null; verifiedName: string | null }>(
                "/api/settings/whatsapp/test",
                { method: "POST", auth: true }
              );
              toast.success(`Connected: ${data.verifiedName ?? "unknown"} (${data.displayPhoneNumber ?? "no number"})`);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Connection test failed");
            } finally {
              setTesting(false);
            }
          }}
        >
          {testing ? "Testing…" : "Test connection"}
        </Button>
      </div>
    </form>
  );
}

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
      <WhatsAppCard />
    </AdminShell>
  );
}
