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

/**
 * Descarga el PDF de una factura por su ID.
 * Hace fetch al endpoint GET /invoices/{invoice_id}/pdf,
 * convierte la respuesta a Blob y dispara la descarga en el navegador.
 */
export async function downloadInvoicePdf(invoiceId, invoiceNumber) {
  const response = await fetch(`${API_URL}/invoices/${invoiceId}/pdf`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : "Error al descargar la factura";
    throw new Error(message);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${invoiceNumber ?? invoiceId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}