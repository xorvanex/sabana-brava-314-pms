import { API_URL } from "@/shared/API/api";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return { Authorization: `Bearer ${token}` };
}

async function parseResponse(response, fallbackError) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof data?.detail === "string" ? data.detail : fallbackError;
    throw new Error(message);
  }
  return data;
}

export async function getAllInvoices() {
  const response = await fetch(`${API_URL}/invoices`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseResponse(response, "Error al obtener facturas");
}

export async function getBillingHistory() {
  return getAllInvoices();
}

export async function getCompanyInvoices(companyId) {
  const response = await fetch(`${API_URL}/invoices/company/${companyId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseResponse(response, "Error al obtener facturas de la empresa");
}

/** Para el filtro por empresa en consultar facturación */
export async function getAllCompanies() {
  const response = await fetch(`${API_URL}/companies/`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseResponse(response, "Error al obtener empresas");
}