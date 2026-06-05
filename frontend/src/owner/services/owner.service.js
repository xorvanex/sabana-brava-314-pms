import { API_URL } from "@/shared/API/api";

// Obtener todas las habitaciones
export async function getAllRooms() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/rooms/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error("Error al obtener habitaciones");
  }

  return data;
}

// Obtener todas las empresas
export async function getAllCompanies() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/companies/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error("Error al obtener empresas");
  }

  return data;
}

// Obtener empresas activas
export async function getActiveCompanies() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/companies/active`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error("Error al obtener empresas activas");
  }

  return data;
}

// Crear contrato
export async function createContract(contractData) {
  const token = localStorage.getItem("access_token");
  
  const body = new FormData();
  body.append("company_id", contractData.companyId);
  body.append("start_date", contractData.startDate);
  body.append("end_date", contractData.endDate);
  body.append("base_rate", contractData.baseRate);
  body.append("terms", contractData.terms);
  if (contractData.description) body.append("description", contractData.description);
  if (contractData.roomIds) {
    contractData.roomIds.forEach(roomId => body.append("room_ids", roomId));
  }

  const response = await fetch(`${API_URL}/contracts/`, {
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
        : "Error al crear contrato";
    throw new Error(message);
  }

  return data;
}

// Obtener todos los contratos
export async function getAllContracts() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/contracts/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error("Error al obtener contratos");
  }

  return data;
}

// Obtener contratos activos
export async function getActiveContracts() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/contracts/active`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error("Error al obtener contratos activos");
  }

  return data;
}
// Descargar contrato PDF
export async function downloadContractPDF(contractId) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/contracts/${contractId}/pdf`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al descargar contrato");
  }

  // Crear blob desde la respuesta
  const blob = await response.blob();
  
  // Crear URL temporal para descargar
  const url = window.URL.createObjectURL(blob);
  
  // Crear elemento a temporal y hacer clic
  const a = document.createElement("a");
  a.href = url;
  a.download = `contract_CTR-${contractId}.pdf`;
  document.body.appendChild(a);
  a.click();
  
  // Limpiar
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Desactivar contrato
export async function toggleContractStatus(contractId) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/contracts/${contractId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error("Error al cambiar estado del contrato");
  }

  return data;
}
// Obtener contratos de una empresa específica
export async function getCompanyContracts(companyId) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/contracts/company/${companyId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error("Error al obtener contratos de la empresa");
  }

  return data;
}
// Generar preview del contrato PDF
export async function previewContractPDF(contractData) {
  const token = localStorage.getItem("access_token");
  
  const body = new FormData();
  body.append("company_id", contractData.companyId);
  body.append("start_date", contractData.startDate);
  body.append("end_date", contractData.endDate);
  body.append("base_rate", contractData.baseRate);
  body.append("terms", contractData.terms);
  if (contractData.description) body.append("description", contractData.description);
  if (contractData.roomIds) {
    contractData.roomIds.forEach(roomId => body.append("room_ids", roomId));
  }

  const response = await fetch(`${API_URL}/contracts/preview/pdf`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText || "Error al generar preview del contrato";
    
    // Intentar parsear como JSON para obtener el detalle del error
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.detail) {
        errorMessage = errorJson.detail;
      }
    } catch (e) {
      // Si no es JSON, usar el texto tal cual
    }
    
    throw new Error(errorMessage);
  }

  const blob = await response.blob();
  return new Blob([blob], { type: 'application/pdf' });
}