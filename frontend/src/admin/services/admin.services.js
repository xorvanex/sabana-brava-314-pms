import { API_URL } from "@/shared/API/api";
import { parseApiError } from "@/admin/utils/parseApiError";
import { getMonthPeriod } from "@/admin/utils/period";
import { getAllInvoices } from "@/shared/serviceGlobal/billing.services";
import { getAllUsers } from "@/shared/serviceGlobal/user.services";

function authHeaders(json = false) {
  const token = localStorage.getItem("access_token");
  const headers = { Authorization: `Bearer ${token}` };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

async function parseResponse(response, fallbackError) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(parseApiError(data, fallbackError));
  }
  return data;
}


// ─── ROOMS ───────────────────────────────────────────────────────────────────

export async function getAllRooms() {
  const response = await fetch(`${API_URL}/rooms/`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseResponse(response, "Error al obtener habitaciones");
}

export async function createRoom(roomData) {
  const body = new FormData();
  body.append("room_number", roomData.numero);
  if (roomData.descripcion) body.append("description", roomData.descripcion);
  body.append("status", roomData.status || "AVAILABLE");

  const response = await fetch(`${API_URL}/rooms/`, {
    method: "POST",
    headers: authHeaders(),
    body,
  });
  return parseResponse(response, "Error al crear habitación");
}

export async function updateRoom(roomId, roomData) {
  const body = new FormData();
  if (roomData.numero) body.append("room_number", roomData.numero);
  if (roomData.descripcion) body.append("description", roomData.descripcion);
  if (roomData.status) body.append("status", roomData.status);

  const response = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: "PUT",
    headers: authHeaders(),
    body,
  });
  return parseResponse(response, "Error al actualizar habitación");
}

export async function updateRoomStatus(roomId, status) {
  const body = new FormData();
  body.append("status", status);

  const response = await fetch(`${API_URL}/rooms/${roomId}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body,
  });
  return parseResponse(response, "Error al cambiar estado de la habitación");
}

export async function deleteRoom(roomId) {
  const response = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(parseApiError(data, "Error al eliminar habitación"));
  }
}

// ─── COMPANIES ───────────────────────────────────────────────────────────────

export async function getAllCompanies() {
  const response = await fetch(`${API_URL}/companies/`, {
    headers: authHeaders(),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error("Error al obtener empresas");
  return data;
}

export async function getCompanyById(companyId) {
  const response = await fetch(`${API_URL}/companies/${companyId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseResponse(response, "Error al obtener la empresa");
}
export async function updateCompany(companyId, companyData) {
  const body = new FormData();
  if (companyData.nombre) body.append("name", companyData.nombre);
  if (companyData.representante) {
    body.append("company_representative", companyData.representante);
  }
  if (companyData.direccion !== undefined) {
    body.append("address", companyData.direccion || "");
  }
  if (companyData.telefono !== undefined) {
    body.append("phone", companyData.telefono || "");
  }
  if (companyData.correo !== undefined) {
    body.append("email", companyData.correo || "");
  }
  if (companyData.activo !== undefined) {
    body.append("is_active", String(companyData.activo));
  }
  // NIT no se envía: no es editable

  const response = await fetch(`${API_URL}/companies/${companyId}`, {
    method: "PUT",
    headers: authHeaders(),
    body,
  });
  return parseResponse(response, "Error al actualizar la empresa");
}

export async function createCompany(companyData) {
  const body = new FormData();
  body.append("name", companyData.nombre);
  body.append("nit", companyData.nit);
  body.append("company_representative", companyData.representante);
  if (companyData.direccion) body.append("address", companyData.direccion);
  if (companyData.telefono) body.append("phone", companyData.telefono);
  if (companyData.correo) body.append("email", companyData.correo);

  const response = await fetch(`${API_URL}/companies/`, {
    method: "POST",
    headers: authHeaders(),
    body,
  });
  return parseResponse(response, "Error al registrar empresa");
}



// ─── CONTRACTS (preflight opcional) ─────────────────────────────────────────
export async function getCompanyContracts(companyId) {
  const response = await fetch(`${API_URL}/contracts/company/${companyId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseResponse(response, "Error al consultar contratos de la empresa");
}
export function hasActiveContractInPeriod(contracts, periodStart, periodEnd) {
  const start = new Date(`${periodStart}T00:00:00`);
  const end = new Date(`${periodEnd}T23:59:59`);
  return (contracts ?? []).some((c) => {
    if (!c.is_active) return false;
    const cs = new Date(`${c.start_date}T00:00:00`);
    const ce = new Date(`${c.end_date}T23:59:59`);
    return cs <= end && ce >= start;
  });
}

// ─── ADMIN SUMMARY ────────────────────────────────────────────────────────────

export async function getAdminSummary() {
  try {
    const [rooms, companies, invoices] = await Promise.all([
      getAllRooms(),
      getAllCompanies(),
      getAllInvoices(),
    ]);

    let usuariosActivos = 0;
    try {
      const users = await getAllUsers();
      usuariosActivos = users.filter((u) => u.is_active).length;
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      usuariosActivos = 0;
    }

    const disponibles = rooms.filter((r) => r.status === "AVAILABLE").length;
    const empresasActivas = companies.filter((c) => c.is_active).length;
    const facturasPendientes = invoices.filter(
      (i) => i.invoice_status === "PENDING"
    ).length;

    return {
      totalHabitaciones: rooms.length,
      habitacionesDisponibles: disponibles,
      totalEmpresas: companies.length,
      empresasActivas,
      facturasRegistradas: invoices.length,
      facturasPendientesPago: facturasPendientes,
      usuariosActivos,
    };
  } catch {
    return {
      totalHabitaciones: 0,
      habitacionesDisponibles: 0,
      totalEmpresas: 0,
      empresasActivas: 0,
      facturasRegistradas: 0,
      facturasPendientesPago: 0,
      usuariosActivos: 0,
    };
  }
}


// ─── BILLING ─────────────────────────────────────────────────────────────────

export async function getBillingHistory() {
  // TODO: conectar cuando exista GET /billing/
  return [];
}

export async function generateMonthlyInvoice({ empresaId, period_start, period_end }) {
  const body = new FormData();
  body.append("company_id", empresaId);
  body.append("period_start", period_start); 
  body.append("period_end", period_end);     

  const response = await fetch(`${API_URL}/invoices/generate`, {
    method: "POST",
    headers: authHeaders(),
    body,
  });
  return parseResponse(response, "Error al generar la factura mensual");
}

// ─── CONTRACTS ───────────────────────────────────────────────────────────────

export async function getContractsByCompany(companyId) {
  const response = await fetch(`${API_URL}/contracts/company/${companyId}`, {
    headers: authHeaders(),
  });
  return parseResponse(response, "Error al obtener contratos de la empresa");
}

// ─── RESERVATIONS ─────────────────────────────────────────────────────────────

export async function getReservationsByCompany(companyId) {
  const response = await fetch(`${API_URL}/reservations/company/${companyId}`, {
    headers: authHeaders(),
  });
  return parseResponse(response, "Error al obtener reservas de la empresa");
}