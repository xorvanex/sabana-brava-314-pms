import { ROUTES } from "@/shared/constants/routes";

export function getRedirectByRole(rol) {
  if (!rol) return ROUTES.INICIO;

  if (rol === "PROPIETARIO") return ROUTES.OWNER_HOME;
  if (rol === "ADMINISTRADOR") return ROUTES.ADMIN_HOME || ROUTES.INICIO;
  if (rol === "RECEPCIONISTA") return ROUTES.RECEPTION_HOME || ROUTES.INICIO;

  return ROUTES.INICIO;
}