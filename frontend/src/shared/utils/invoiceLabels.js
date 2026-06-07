export const INVOICE_STATUS_LABELS = {
  PENDING: "Pendiente de pago",
  ISSUED: "Emitida",
  CANCELLED: "Cancelada",
};

export const DIAN_STATUS_LABELS = {
  PENDING: "Pendiente DIAN",
  SENT: "Enviada a DIAN",
  ACCEPTED: "Aceptada por DIAN",
  REJECTED: "Rechazada por DIAN",
  ERROR: "Error DIAN",
};

export function formatInvoiceStatus(status) {
  return INVOICE_STATUS_LABELS[status] ?? status ?? "—";
}

export function formatDianStatus(status) {
  return DIAN_STATUS_LABELS[status] ?? status ?? "—";
}

export function formatCurrency(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-CO");
}