import { API_URL } from "@/shared/API/api";

export async function createReceptionist(userData) {
  const token = localStorage.getItem("access_token");
  
  const body = new FormData();
  body.append("nombre", userData.nombre);
  body.append("email", userData.email);
  body.append("password", userData.password);
  body.append("telefono", userData.telefono || "");

  const response = await fetch(`${API_URL}/users/receptionist`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : "Error al crear usuario";
    throw new Error(message);
  }

  return data;
}

export async function getAllUsers() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/users/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error("Error al obtener usuarios");
  }

  return data;
}

export async function toggleUserStatus(userId) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error("Error al cambiar estado del usuario");
  }

  return data;
}

export async function getOwnerSummary() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/users/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Si falla, retorna datos mock como fallback
    return {
      totalFacturas: 0,
      contratosActivos: 0,
      usuariosActivos: data?.length || 0,
    };
  }

  return {
    totalFacturas: 0, // Pendiente de implementar endpoint de facturación
    contratosActivos: 0, // Pendiente de implementar endpoint de contratos
    usuariosActivos: data?.length || 0,
  };
}