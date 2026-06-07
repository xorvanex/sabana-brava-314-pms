import { ROUTES } from "./routes";

export const OWNER_MENU = [
  { label: "Dashboard", href: ROUTES.OWNER_HOME },
  { label: "Consultar facturación", href: ROUTES.OWNER_BILLING },
  { label: "Gestionar contrato", href: ROUTES.OWNER_CONTRACTS },
  { label: "Crear nuevo recepcionista", href: ROUTES.OWNER_USERS },
];


export const ADMIN_MENU = [

  { label: "Dashboard", href: ROUTES.ADMIN_HOME },
  { label: "Registrar habitación", href: ROUTES.ADMIN_ROOMS_REGISTER },
  { label: "Gestionar estado de habitación", href: ROUTES.ADMIN_ROOMS_STATUS },
  { label: "Gestionar empresas", href: ROUTES.ADMIN_COMPANIES },
  { label: "Generar factura mensual", href: ROUTES.ADMIN_BILLING_GENERATE },
  { label: "Consultar facturación", href: ROUTES.ADMIN_BILLING },
  { label: "Crear nuevo recepcionista", href: ROUTES.ADMIN_USER },

];

export const RECEPTIONIST_MENU = [
  { label: "Dashboard", href: ROUTES.RECEPTIONIST_HOME },
  { label: "Consultar disponibilidad", href: ROUTES.RECEPTIONIST_AVAILABILITY },
  { label: "Check In", href: ROUTES.RECEPTIONIST_CHECKIN },
  { label: "Registrar reserva", href: ROUTES.RECEPTIONIST_RESERVATION },
];