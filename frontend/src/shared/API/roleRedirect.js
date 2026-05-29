import { ROUTES } from "@/shared/constants/routes";

export function getRedirectByRole(rol) {
  if (!rol) return ROUTES.INICIO;

  // Aceptar ambos formatos: DUEÑA (BD original) y OWNER (nuevo backend)
  if (rol === "DUEÑA" || rol === "DUENA" || rol === "OWNER") return ROUTES.OWNER_HOME;
  if (rol === "ADMINISTRATOR") return ROUTES.ADMIN_HOME || ROUTES.INICIO;
  if (rol === "RECEPCIONIST") return ROUTES.RECEPTION_HOME || ROUTES.INICIO;

  return ROUTES.INICIO;
}