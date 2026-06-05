import { API_URL } from "@/shared/API/api";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return { Authorization: `Bearer ${token}` };
}

export async function getReceptionistSummary() {
  const headers = authHeaders();

  // Realizamos las tres peticiones reales en paralelo al Backend
  const [roomsRes, guestsRes, reservationsRes] = await Promise.all([
    fetch(`${API_URL}/rooms/`, { headers }),
    fetch(`${API_URL}/guests/`, { headers }),
    fetch(`${API_URL}/reservations/active`, { headers })
  ]);

  // Si alguna de las peticiones falla (ej. error 500, 401, etc.), lanzamos error
  if (!roomsRes.ok || !guestsRes.ok || !reservationsRes.ok) {
    throw new Error("No se pudieron obtener los datos reales del servidor.");
  }

  const rooms = await roomsRes.json();
  const guests = await guestsRes.json();
  const reservations = await reservationsRes.json();

  // Filtramos las habitaciones reales del backend que estén activas y en estado AVAILABLE
  const availableRoomsCount = rooms.filter(
    (r) => r.status === "AVAILABLE" && r.is_active
  ).length;

  return {
    availableRooms: availableRoomsCount,
    totalGuests: guests.length, // Conteo de huéspedes reales en base de datos
    activeReservations: reservations.length // Conteo de reservas activas reales
  };
}
export async function getRoomAvailabilityData() {
  const headers = authHeaders();

  // Obtenemos habitaciones y reservas activas de la base de datos
  const [roomsRes, reservationsRes] = await Promise.all([
    fetch(`${API_URL}/rooms/`, { headers }),
    fetch(`${API_URL}/reservations/`, { headers })
  ]);

  if (!roomsRes.ok || !reservationsRes.ok) {
    throw new Error("No se pudieron obtener los datos de disponibilidad.");
  }

  const rooms = await roomsRes.json();
  const reservations = await reservationsRes.json();

  return {
    rooms: rooms.filter((r) => r.is_active), // Solo habitaciones activas
    // Filtramos para ignorar reservas canceladas o no presentadas en el calendario
    reservations: reservations.filter(
      (res) => res.status !== "CANCELLED" && res.status !== "NO_SHOW"
    )
  };
}



export async function getAllGuests() {
  const res = await fetch(`${API_URL}/guests/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("No se pudieron obtener los huéspedes.");
  return await res.json();          // → [{ id, first_name, last_name, document_number, ... }]
}
export async function createGuest(guestData) {
  const body = new FormData();
  Object.entries(guestData).forEach(([k, v]) => body.append(k, v));
  const res = await fetch(`${API_URL}/guests/`, {
    method: "POST",
    headers: authHeaders(),
    body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    const errorMessage = err?.detail || err?.message || JSON.stringify(err) || "Error al crear el huésped.";
    throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
  }
  return await res.json();          // → huésped creado
}

// Obtiene todas las habitaciones (solo activas)
export async function getAllRooms() {
  const res = await fetch(`${API_URL}/rooms/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("No se pudieron obtener las habitaciones.");
  return await res.json();          // → [{ id, room_number, capacity, status, is_active }, …]
}

export async function createReservation(reservationData) {
  const body = new FormData();
  // campos del schema ReservationCreate (ver backend)
  body.append("company_id", reservationData.company_id);
  body.append("contract_id", reservationData.contract_id);
  body.append("start_date", reservationData.start_date);
  body.append("end_date", reservationData.end_date);
  body.append("guest_count", reservationData.guest_count);
  body.append("status", reservationData.status ?? "PENDING");
  body.append("notes", reservationData.notes ?? "");
  // lista de habitaciones (array de UUID)
  reservationData.room_ids?.forEach((id) => body.append("room_ids", id));
  const res = await fetch(`${API_URL}/reservations/`, {
    method: "POST",
    headers: authHeaders(),
    body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail ?? "Error al crear la reserva.");
  }
  return await res.json();          // → reserva creada
}

/*  RESERVAS ACTIVAS (para cálculo de disponibilidad)                */

export async function getActiveReservations() {
  const res = await fetch(`${API_URL}/reservations/active`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("No se pudieron cargar reservas activas.");
  return await res.json();     
}

/*  EMPRESAS                                                          */

export async function getAllCompanies() {
  const res = await fetch(`${API_URL}/companies/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("No se pudieron obtener las empresas.");
  return await res.json();
}

export async function getCompanyContracts(companyId) {
  const res = await fetch(`${API_URL}/contracts/company/${companyId}`, { 
    headers: authHeaders() 
  });
  if (!res.ok) throw new Error("No se pudieron obtener los contratos de la empresa.");
  return await res.json();
}