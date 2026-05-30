import { API_URL } from "@/shared/API/api";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return { Authorization: `Bearer ${token}` };
}

// ─── ROOMS ───────────────────────────────────────────────────────────────────

export async function getAllRooms() {
  const response = await fetch(`${API_URL}/rooms/`, {
    method: "GET",
    headers: authHeaders(),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error("Error al obtener habitaciones");
  return data;
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
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof data?.detail === "string" ? data.detail : "Error al crear habitación";
    throw new Error(message);
  }
  return data;
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
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof data?.detail === "string" ? data.detail : "Error al actualizar habitación";
    throw new Error(message);
  }
  return data;
}

export async function updateRoomStatus(roomId, status) {
  const body = new FormData();
  body.append("status", status);

  const response = await fetch(`${API_URL}/rooms/${roomId}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error("Error al cambiar estado de la habitación");
  return data;
}

export async function deleteRoom(roomId) {
  const response = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Error al eliminar habitación");
}

// ─── COMPANIES ───────────────────────────────────────────────────────────────

export async function getAllCompanies() {
  const response = await fetch(`${API_URL}/companies/`, {
    method: "GET",
    headers: authHeaders(),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error("Error al obtener empresas");
  return data;
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
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof data?.detail === "string" ? data.detail : "Error al registrar empresa";
    throw new Error(message);
  }
  return data;
}

// ─── BILLING (stub hasta que exista endpoint) ─────────────────────────────────

export async function getBillingHistory() {
  return [];
}

export async function generateMonthlyInvoice({ empresaId, mes, anio }) {
  void empresaId;
  void mes;
  void anio;
  throw new Error("El endpoint de facturación mensual aún no está disponible");
}

// ─── ADMIN SUMMARY ────────────────────────────────────────────────────────────

export async function getAdminSummary() {
  try {
    const [rooms, companies] = await Promise.all([
      getAllRooms(),
      getAllCompanies(),
    ]);

    const disponibles = rooms.filter((r) => r.status === "AVAILABLE").length;
    const empresasActivas = companies.filter((c) => c.is_active).length;

    return {
      totalHabitaciones: rooms.length,
      habitacionesDisponibles: disponibles,
      totalEmpresas: companies.length,
      empresasActivas,
      facturasRegistradas: 0,
    };
  } catch {
    return {
      totalHabitaciones: 0,
      habitacionesDisponibles: 0,
      totalEmpresas: 0,
      empresasActivas: 0,
      facturasRegistradas: 0,
    };
  }
}