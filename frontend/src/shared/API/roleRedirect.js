import { ROUTES } from "@/shared/constants/routes";

export function getRedirectByRole(rol) {
  if (!rol) return ROUTES.INICIO;
  if (rol === "DUEÑA" || rol === "DUENA" || rol === "OWNER") return ROUTES.OWNER_HOME;
  if (rol === "ADMINISTRATOR" || rol === "ADMINISTRADOR") return ROUTES.ADMIN_HOME || ROUTES.INICIO;
  if (rol === "RECEPCIONISTA" || rol === "RECEPTIONIST") return ROUTES.RECEPTIONIST_HOME || ROUTES.INICIO;

  return ROUTES.INICIO;
}