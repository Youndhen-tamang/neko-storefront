"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { api, getAgencySlug } from "@/lib/api";

function ResetInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api("/api/auth/admin/reset-password", {
        method: "POST",
        slug: getAgencySlug(),
        body: JSON.stringify({ token, password }),
      });
      toast.success("Password updated. Sign in with your new password.");
      router.push("/admin/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Agency admin</p>
      <h1 className="mt-2 font-serif text-4xl">New password</h1>
      {!token ? (
        <div className="mt-8 space-y-4">
          <p className="text-sm text-muted-foreground">This reset link is missing. Request a new one from sign in.</p>
          <Button asChild className="w-full">
            <Link href="/admin/forgot-password">Forgot password</Link>
          </Button>
        </div>
      ) : (
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Update password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <ResetInner />
    </Suspense>
  );
}
