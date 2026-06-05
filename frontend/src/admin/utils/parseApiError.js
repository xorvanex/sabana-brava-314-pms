/**
 * Traduce respuestas de error del backend (FastAPI) a mensajes en español.
 */
const MESSAGE_MAP = {
  "Company NIT already registered": "El NIT ya está registrado. Verifica el número o consulta la empresa existente.",
  "Room number already exists": "Ese número de habitación ya existe. Usa otro número.",
  "Room not found": "La habitación no fue encontrada.",
  "Company not found": "La empresa no fue encontrada.",
  "Error al obtener habitaciones": "No se pudo cargar el listado de habitaciones. Intenta de nuevo.",
  "Error al obtener empresas": "No se pudo cargar el listado de empresas. Intenta de nuevo.",
  "Error al crear habitación": "No se pudo registrar la habitación.",
  "Error al registrar empresa": "No se pudo registrar la empresa.",
  "Error al cambiar estado de la habitación": "No se pudo actualizar el estado de la habitación.",
  "El endpoint de facturación mensual aún no está disponible":
    "La generación de facturas mensuales aún no está disponible en el sistema.",
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
};

function translateDetail(detail) {
  if (!detail) return null;
  if (typeof detail === "string") {
    return MESSAGE_MAP[detail] ?? detail;
  }
  if (Array.isArray(detail)) {
    const lines = detail.map((item) => {
      const field = item?.loc?.slice(-1)?.[0];
      const label = FIELD_LABELS[field] ?? field ?? "campo";
      const msg = item?.msg ?? "valor inválido";
      return `${label}: ${msg}`;
    });
    return lines.join(" · ");
  }
  return null;
}

export function parseApiError(data, fallback) {
  const fromDetail = translateDetail(data?.detail);
  if (fromDetail) return fromDetail;
  if (typeof data?.message === "string") return data.message;
  return fallback;
}

/** Validaciones antes de llamar al API (formularios admin). */
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
  if ((form.representante ?? "").trim().length < 5) {
    return "El representante legal debe tener al menos 5 caracteres.";
  }
  const email = (form.correo ?? "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "El correo electrónico no es válido.";
  }
  return null;
}