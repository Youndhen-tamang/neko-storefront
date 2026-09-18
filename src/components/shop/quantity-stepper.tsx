"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  min = 0,
  max,
  onChange,
  disabled,
  size = "default",
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  size?: "sm" | "default";
}) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const canDec = !disabled && value > min;
  const canInc = !disabled && value < max;

  return (
    <div
      className={cn(
        "inline-flex items-center overflow-hidden rounded-md border border-input bg-background",
        disabled && "opacity-50"
      )}
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={!canDec}
        className={cn(
          dim,
          "grid place-items-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        )}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-8 px-1 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={!canInc}
        className={cn(
          dim,
          "grid place-items-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        )}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
