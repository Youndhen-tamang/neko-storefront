"use client";

import { LANDING_TEMPLATE_META, LANDING_TEMPLATES, LandingTemplateId } from "@/lib/templates";
import { cn } from "@/lib/utils";

function TemplatePreview({ id }: { id: LandingTemplateId }) {
  if (id === "boutique") {
    return (
      <div className="overflow-hidden rounded-md border bg-neutral-900">
        <div className="h-14 bg-gradient-to-r from-neutral-700 to-neutral-500" />
        <div className="grid grid-cols-3 gap-1 p-2">
          <div className="col-span-2 h-10 rounded-sm bg-neutral-600" />
          <div className="h-10 rounded-sm bg-neutral-700" />
        </div>
      </div>
    );
  }
  if (id === "marketplace") {
    return (
      <div className="overflow-hidden rounded-md border bg-white">
        <div className="h-6 bg-primary/80" />
        <div className="grid grid-cols-4 gap-1 p-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-square rounded-sm bg-muted" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-md border bg-card">
      <div className="space-y-1 p-2">
        <div className="h-2 w-16 rounded bg-muted" />
        <div className="h-3 w-28 rounded bg-foreground/20" />
      </div>
      <div className="grid grid-cols-3 gap-1 p-2 pt-0">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="aspect-[3/4] rounded-sm bg-muted" />
        ))}
      </div>
    </div>
  );
}

export function TemplatePicker({
  value,
  onChange,
  saving,
  pendingId,
}: {
  value: LandingTemplateId;
  onChange: (id: LandingTemplateId) => void;
  saving?: boolean;
  pendingId?: LandingTemplateId | null;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {LANDING_TEMPLATES.map((id) => {
        const meta = LANDING_TEMPLATE_META[id];
        const selected = value === id;
        const isSaving = Boolean(saving && pendingId === id);
        return (
          <button
            key={id}
            type="button"
            disabled={saving}
            onClick={() => onChange(id)}
            className={cn(
              "rounded-2xl border bg-card p-4 text-left transition hover:border-primary/50",
              selected && "border-primary ring-2 ring-primary/20"
            )}
          >
            <TemplatePreview id={id} />
            <p className="mt-3 font-serif text-xl">{meta.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                {isSaving ? "Saving..." : selected ? "Active" : "Use this template"}
              </p>
              <a
                href={`/?preview=${id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                onClick={(event) => event.stopPropagation()}
              >
                Preview
              </a>
            </div>
          </button>
        );
      })}
    </div>
  );
}
