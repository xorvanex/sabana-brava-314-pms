"use client";

import { RECEPTIONIST_MENU } from "@/shared/constants/menus";

export function useReceptionist() {
  return { menuItems: RECEPTIONIST_MENU };
}