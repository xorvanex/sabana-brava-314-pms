// File path: frontend/src/admin/hooks/useAdmin.js

import { ADMIN_MENU } from "@/shared/constants/menus";

export function useAdmin() {
  return { menuItems: ADMIN_MENU };
}