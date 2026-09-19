"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, getAgencySlug } from "@/lib/api";
import { storeUrlForSlug } from "@/lib/tenant";

export default function ForgotPasswordPage() {
  const [ready, setReady] = useState(false);
  const [hostSlug, setHostSlug] = useState("");
  const [agencySlug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const slug = getAgencySlug();
    setHostSlug(slug);
    setSlug(slug);
    setReady(true);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (!hostSlug) {
        window.location.href = storeUrlForSlug(agencySlug, "/admin/forgot-password");
        return;
      }
      const data = await api<{ message: string }>("/api/auth/admin/forgot-password", {
        method: "POST",
        slug: hostSlug,
        body: JSON.stringify({ email, agencySlug: hostSlug }),
      });
      setSent(true);
      toast.success(data.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send reset email");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Agency admin</p>
      <h1 className="mt-2 font-serif text-4xl">Forgot password</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        We will email a reset link to the admin address for this shop.
      </p>
      {sent ? (
        <div className="mt-8 space-y-4">
          <p className="text-sm">If that account exists, check the inbox for a link that expires in one hour.</p>
          <Button asChild className="w-full">
            <Link href="/admin/login">Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          {!hostSlug && (
            <div className="space-y-2">
              <Label>Agency slug</Label>
              <Input
                value={agencySlug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="lumen"
                required
              />
            </div>
          )}
          {hostSlug && (
            <div className="space-y-2">
              <Label htmlFor="reset-email">Admin email</Label>
              <Input
                id="reset-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          <Button className="w-full" type="submit" disabled={loading || !agencySlug}>
            {loading ? "Sending..." : hostSlug ? "Send reset link" : "Continue to store"}
          </Button>
          <p className="text-center text-sm">
            <Link href="/admin/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
