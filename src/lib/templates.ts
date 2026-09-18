export const LANDING_TEMPLATES = ["atelier", "boutique", "marketplace"] as const;

export type LandingTemplateId = (typeof LANDING_TEMPLATES)[number];

export const DEFAULT_LANDING_TEMPLATE: LandingTemplateId = "atelier";

export const LANDING_TEMPLATE_META: Record<
  LandingTemplateId,
  { name: string; description: string }
> = {
  atelier: {
    name: "Atelier",
    description: "Editorial catalog with portrait cards and a quiet, gallery-like layout.",
  },
  boutique: {
    name: "Boutique",
    description: "Lookbook landing with a full-bleed hero, featured pieces, and a magazine grid.",
  },
  marketplace: {
    name: "Marketplace",
    description: "High-conversion shop with search, category filters, and a dense product grid.",
  },
};

export function parseLandingTemplate(value?: string | null): LandingTemplateId | null {
  if (value === "boutique" || value === "marketplace" || value === "atelier") return value;
  return null;
}

export function normalizeLandingTemplate(value?: string | null): LandingTemplateId {
  return parseLandingTemplate(value) ?? DEFAULT_LANDING_TEMPLATE;
}
