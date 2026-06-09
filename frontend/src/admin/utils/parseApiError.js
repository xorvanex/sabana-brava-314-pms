const MESSAGE_MAP = {
  "Company NIT already registered":
    "El NIT ya está registrado. Verifica el número o consulta la empresa existente.",
  "Room number already exists": "Ese número de habitación ya existe. Usa otro número.",
  "Room not found": "La habitación no fue encontrada.",
  "Company not found": "La empresa no fue encontrada.",
  "Invoice not found": "La factura no fue encontrada.",
  "No active contract found for company":
  "No hay un contrato vigente asociado a la empresa para el periodo seleccionado.",
  "Invoice already exists for company in period":
  "Ya existe una factura generada para esta empresa en el periodo seleccionado.",
  "No billable reservations found for selected period":
    "No se puede generar la factura: debe existir al menos una reserva registrada en el periodo y un contrato vigente.",
  "Only pending invoices can be cancelled":
    "Solo se pueden cancelar facturas en estado pendiente de pago.",
  "Error al obtener habitaciones": "No se pudo cargar el listado de habitaciones.",
  "Error al obtener empresas": "No se pudo cargar el listado de empresas.",
  "Error al obtener facturas": "No se pudo cargar el historial de facturación.",
  "Error al generar la factura mensual": "No se pudo generar la factura mensual.",
};

const FIELD_LABELS = {
  room_number: "Número de habitación",
  description: "Descripción",
  status: "Estado",
  name: "Nombre",
  nit: "NIT",
  company_representative: "Representante legal",
  address: "Dirección",
  phone: "Teléfono",
  email: "Correo",
  company_id: "Empresa",
  period_start: "Inicio del periodo",
  period_end: "Fin del periodo",
};

function translateDetail(detail) {
  if (!detail) return null;
  if (typeof detail === "string") {
    // Coincidencia exacta primero
    if (MESSAGE_MAP[detail]) return MESSAGE_MAP[detail];

    // Coincidencia parcial para mensajes con datos dinámicos
    const partialKey = Object.keys(MESSAGE_MAP).find((key) =>
      detail.startsWith(key)
    );
    if (partialKey) return MESSAGE_MAP[partialKey];

    return detail;
  }
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const field = item?.loc?.slice(-1)?.[0];
        const label = FIELD_LABELS[field] ?? field ?? "campo";
        return `${label}: ${item?.msg ?? "valor inválido"}`;
      })
      .join(" · ");
  }
  return null;
}

export function parseApiError(data, fallback) {
  const fromDetail = translateDetail(data?.detail);
  if (fromDetail) return fromDetail;
  if (typeof data?.message === "string") return data.message;
  return fallback;
}

export function validateRoomForm({ numero, descripcion }) {
  const trimmed = (numero ?? "").trim();
  if (!trimmed) return "El número de habitación es obligatorio.";
  if (trimmed.length > 20) return "El número no puede superar 20 caracteres.";
  if (descripcion && descripcion.length > 500) {
    return "La descripción no puede superar 500 caracteres.";
  }
  return null;
}

export function validateCompanyForm(form) {
  if (!(form.nombre ?? "").trim()) return "El nombre de la empresa es obligatorio.";
  if ((form.nombre ?? "").trim().length < 2) {
    return "El nombre debe tener al menos 2 caracteres.";
  }
  const nit = (form.nit ?? "").trim();
  if (!nit) return "El NIT es obligatorio.";
  if (nit.length < 5 || nit.length > 30) {
    return "El NIT debe tener entre 5 y 30 caracteres.";
  }
  if (!(form.representante ?? "").trim()) {
    return "El representante legal es obligatorio.";
  }
  const email = (form.correo ?? "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "El correo electrónico no es válido.";
  }
  return null;
}

export function validateCompanyUpdateForm(form) {
  if (!(form.representante ?? "").trim()) {
    return "El representante legal es obligatorio.";
  }
  const email = (form.correo ?? "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "El correo electrónico no es válido.";
  }
  return null;
}

export function validateInvoiceForm({ empresaId, mes, anio }) {
  if (!empresaId) return "Debes seleccionar una empresa.";
  const mesNum = Number(mes);
  const anioNum = Number(anio);
  if (mesNum < 1 || mesNum > 12) return "El mes debe estar entre 1 y 12.";
  if (anioNum < 2000) return "El año no es válido.";
  return null;
}