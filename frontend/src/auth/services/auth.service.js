import { API_URL } from "@/shared/API/api";

export async function login(email, password) {
  const body = new FormData();
  body.append("username", email);
  body.append("password", password);

  const response = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    body,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : "No se pudo iniciar sesión. Verifica tus credenciales.";
    throw new Error(message);
  }

  // Adaptar la respuesta del backend al formato que espera el frontend
  return {
    access_token: data.access_token,
    token_type: data.token_type,
    usuario: {
      nombre: data.user?.name || data.user?.nombre || "",
      rol: data.user?.role || data.user?.rol || ""
    }
  };
}