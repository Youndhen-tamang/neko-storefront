"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { slugify } from "@/lib/slug";

const emptyForm = {
  name: "",
  slug: "",
  brandName: "",
  tagline: "",
  email: "",
  phone: "",
  address: "",
  adminName: "",
  adminEmail: "",
  message: "",
};

export default function TenantRequestPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Agency onboarding</p>
        <h1 className="mt-3 text-3xl font-medium">Request received</h1>
        <p className="mt-3 text-muted-foreground">
          A super admin will review your details and create your tenant storefront. We will contact you at the email you
          provided.
        </p>
        <Button className="mt-8 w-full" asChild>
          <Link href="/">Back to Homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Agency onboarding</p>
      <h1 className="mt-3 text-3xl font-medium sm:text-4xl">Request a tenant</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tell us about your shop. Super admin will use this to create your agency without starting from a blank form.
      </p>
      <form
        className="mt-8 grid gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          try {
            await api("/api/tenant-requests", {
              method: "POST",
              body: JSON.stringify({
                ...form,
                slug: slugify(form.slug || form.name),
                brandName: form.brandName || form.name,
                email: form.email || form.adminEmail,
              }),
            });
            setSubmitted(true);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not submit request");
          } finally {
            setLoading(false);
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Agency name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((current) => ({
                ...current,
                name,
                slug: slugTouched ? current.slug : slugify(name),
              }));
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Desired store slug</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", slugify(e.target.value));
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brandName">Brand name</Label>
          <Input id="brandName" value={form.brandName} onChange={(e) => set("brandName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="adminName">Contact name</Label>
            <Input id="adminName" value={form.adminName} onChange={(e) => set("adminName", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Contact email</Label>
            <Input
              id="adminEmail"
              type="email"
              value={form.adminEmail}
              onChange={(e) => set("adminEmail", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Agency email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Why you want a store</Label>
          <Textarea
            id="message"
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Optional note for the super admin"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Sending request..." : "Submit request"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
         Problem with the form?{" "}
          <Link href="mailto:support@theoneandonly.co" className="text-primary hover:underline">
            Contact support
          </Link>
        </p>
      </form>
    </div>
  );
}
