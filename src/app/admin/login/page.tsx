"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { api, getAgencySlug, setAdminToken } from "@/lib/api";
import { storeUrlForSlug } from "@/lib/tenant";

export default function AdminLoginPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hostSlug, setHostSlug] = useState("");
  const [agencySlug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
        window.location.href = storeUrlForSlug(agencySlug, "/admin/login");
        return;
      }
      const data = await api<{ token: string }>("/api/auth/admin/login", {
        method: "POST",
        slug: hostSlug,
        body: JSON.stringify({ email, password, agencySlug: hostSlug }),
      });
      setAdminToken(data.token);
      router.push("/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Agency admin</p>
      <h1 className="mt-2 font-serif text-4xl">Sign in</h1>
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
            <p className="text-xs text-muted-foreground">
              Continue on {agencySlug || "your-slug"}.localhost:3000
            </p>
          </div>
        )}
        {hostSlug && (
          <>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="admin-password">Password</Label>
                <Link href="/admin/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="admin-password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </>
        )}
        <Button className="w-full" type="submit" disabled={loading || !agencySlug}>
          {loading ? "Signing in..." : hostSlug ? "Enter dashboard" : "Continue to store"}
        </Button>
      </form>
    </div>
  );
}
