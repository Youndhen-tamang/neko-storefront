"use client";

import { createContext, useContext } from "react";
import { Branding } from "@/lib/api";
import { DEFAULT_LANDING_TEMPLATE, LandingTemplateId } from "@/lib/templates";

export type ShopContextValue = {
  branding: Branding | null;
  cartItemCount: number;
  template: LandingTemplateId;
};

export const ShopContext = createContext<ShopContextValue>({
  branding: null,
  cartItemCount: 0,
  template: DEFAULT_LANDING_TEMPLATE,
});

export function useShop() {
  return useContext(ShopContext);
}
