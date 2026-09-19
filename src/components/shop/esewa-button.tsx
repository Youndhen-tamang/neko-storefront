"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export type EsewaCheckoutPayload = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  items: { productId: string; quantity: number }[];
};

type EsewaForm = { action: string; fields: Record<string, string> };

/** eSewa only accepts a browser form POST, so build one and submit it. */
export function submitEsewaForm(form: EsewaForm) {
  const el = document.createElement("form");
  el.method = "POST";
  el.action = form.action;
  el.style.display = "none";
  for (const [name, value] of Object.entries(form.fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    el.appendChild(input);
  }
  document.body.appendChild(el);
  el.submit();
}

export function EsewaButton({
  payload,
  label,
  disabled,
  validate,
  onError,
}: {
  payload: EsewaCheckoutPayload;
  label: string;
  disabled?: boolean;
  /** Return false to abort (after showing your own message). */
  validate?: () => boolean;
  onError?: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function pay() {
    if (validate && !validate()) return;
    setLoading(true);
    try {
      const form = await api<EsewaForm>("/api/esewa/initiate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      submitEsewaForm(form);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "eSewa checkout failed");
      setLoading(false);
    }
  }

  return (
    <Button
      className="w-full bg-[#60bb46] text-white hover:bg-[#4ea338]"
      size="lg"
      type="button"
      disabled={disabled || loading}
      onClick={() => void pay()}
    >
      {loading ? "Redirecting to eSewa..." : label}
    </Button>
  );
}
