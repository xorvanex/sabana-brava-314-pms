import { ROUTES } from "./routes";

export const OWNER_MENU = [
  { label: "Dashboard", href: ROUTES.OWNER_HOME },
  { label: "Consultar facturación", href: ROUTES.OWNER_BILLING },
  { label: "Gestionar contrato", href: ROUTES.OWNER_CONTRACTS },
  { label: "Crear nuevo recepcionista", href: ROUTES.OWNER_USERS },
];

// Más adelante podrás agregar:
export const ADMIN_MENU = [];
export const RECEPTIONIST_MENU = [];