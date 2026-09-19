"use client";

import { Button } from "@/components/ui/button";

export function A11yWelcome({
  brandName,
  onAccept,
  onDismiss,
  onDontAskAgain,
}: {
  brandName: string;
  onAccept: () => void;
  onDismiss: () => void;
  onDontAskAgain: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-labelledby="a11y-welcome-title">
      <button
        type="button"
        aria-label="Dismiss spoken assistant"
        className="absolute inset-0 bg-black/40"
        onClick={onDismiss}
      />
      <div className="absolute inset-x-0 bottom-0 animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto max-w-lg rounded-t-2xl border bg-card px-5 pb-5 pt-3 shadow-sm">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30" aria-hidden="true" />
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
            <Button type="button" variant="ghost" onClick={onDontAskAgain}>
              Don&apos;t ask me again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
