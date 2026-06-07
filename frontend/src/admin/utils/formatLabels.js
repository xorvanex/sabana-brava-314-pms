export const ROOM_STATUS_LABELS = {
  AVAILABLE: "Disponible",
  OCCUPIED: "Ocupada",
  BLOCKED: "Bloqueada",
  MAINTENANCE: "Mantenimiento",
  OUT_OF_SERVICE: "Fuera de servicio",
};

export function formatRoomStatus(status) {
  return ROOM_STATUS_LABELS[status] ?? status ?? "—";
}

export function formatInvoiceStatus(status) {
  const labels = {
    PENDING: "Pendiente de pago",
    PAID: "Pagada",
    CANCELLED: "Cancelada",
    OVERDUE: "Vencida",
  };
  return labels[status] ?? status;
}