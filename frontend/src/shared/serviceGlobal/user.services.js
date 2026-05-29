import { API_URL } from "@/shared/API/api";

export async function createReceptionist(userData) {
  const token = localStorage.getItem("access_token");
  
  const body = new FormData();
  body.append("name", userData.nombre);  
  body.append("email", userData.email);
  body.append("password_hash", userData.password);  
  body.append("phone", userData.telefono || "");  

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
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : `Error ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  return data;
}

export async function updateUser(userId, userData) {
  const token = localStorage.getItem("access_token");
  
  const body = new FormData();
  if (userData.nombre) body.append("name", userData.nombre);
  if (userData.email) body.append("email", userData.email);
  if (userData.telefono !== undefined) body.append("phone", userData.telefono);

  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "PUT",
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
        : "Error al actualizar usuario";
    throw new Error(message);
  }

  return data;
}

export async function getOwnerSummary() {
  const token = localStorage.getItem("access_token");
  
  // Obtener el rol del usuario desde localStorage
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const rol = usuario.rol || usuario.role || "";

  // Recepcionista no ve nada
  if (rol === "RECEPTIONIST" || rol === "RECEPCIONISTA") {
    return null;
  }

  // Solo permitir métricas para OWNER y ADMINISTRADOR
  if (rol !== "OWNER" && rol !== "ADMINISTRATOR" && rol !== "DUEÑA") {
    return null;
  }

  const response = await fetch(`${API_URL}/users/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return null;
  }

  // Contratos solo para dueña
  const contratosActivos = (rol === "OWNER" || rol === "DUEÑA") ? 0 : null;

  return {
    totalFacturas: 0,
    contratosActivos: contratosActivos,
    usuariosActivos: data?.length || 0,
  };
}