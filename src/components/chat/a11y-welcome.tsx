"use client";

import { Button } from "@/components/ui/button";

export function A11yWelcome({
  brandName,
  onAccept,
  onDismiss,
}: {
  brandName: string;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-welcome-title"
    >
      <div className="mx-auto max-w-lg rounded-2xl border bg-card p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Spoken shopping</p>
        <h2 id="a11y-welcome-title" className="mt-1 font-serif text-2xl">
          Open the {brandName} assistant?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask me anything. I can also read live inventory and place a dress order whenever you want. If you
          do nothing, I will start the spoken assistant in a few seconds.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={onAccept}>
            Yes, help me shop
          </Button>
          <Button type="button" variant="outline" onClick={onDismiss}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
