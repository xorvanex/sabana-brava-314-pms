"use client";
 
import { useState } from "react";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";
import { downloadContractPDF, toggleContractStatus } from "@/owner/services/owner.service";
 
export default function ContractsList({ contracts, loading, error, onRefresh }) {
  const [search, setSearch] = useState("");
 
  const handleToggleStatus = async (contractId, currentStatus) => {
    try {
      await toggleContractStatus(contractId);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Error al cambiar estado del contrato: " + err.message);
    }
  };
 
  const handleDownload = async (contractId) => {
    try {
      await downloadContractPDF(contractId);
    } catch (err) {
      alert("Error al descargar contrato: " + err.message);
    }
  };
 
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }
 
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }
 
  if (contracts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">No hay contratos registrados</p>
      </div>
    );
  }
 
  const filtered = contracts.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.id.toString().toLowerCase().includes(q) ||
      (c.company?.name || "").toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q) ||
      (c.terms || "").toLowerCase().includes(q)
    );
  });
 
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-emerald-900">
          Contratos registrados
        </h2>
      </div>
 
      {/* Search */}
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <svg
          className="h-4 w-4 shrink-0 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Buscar por empresa, ID o descripción…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
 
      {/* Empty state for search */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            No se encontraron contratos para "{search}"
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((contract) => (
            <div
              key={contract.id}
              className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      Contrato #{contract.id.toString().slice(0, 8)}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        contract.is_active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {contract.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {contract.company?.name || "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(contract.id)}
                    className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar PDF
                  </button>
                  <button
                    onClick={() => handleToggleStatus(contract.id, contract.is_active)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      contract.is_active
                        ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                        : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {contract.is_active ? (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        Desactivar
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Activar
                      </>
                    )}
                  </button>
                </div>
              </div>
 
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-400">Fecha inicio</p>
                  <p className="font-medium text-gray-900">
                    {new Date(contract.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Fecha fin</p>
                  <p className="font-medium text-gray-900">
                    {new Date(contract.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Tarifa base</p>
                  <p className="font-medium text-gray-900">
                    ${parseFloat(contract.base_rate).toFixed(2)}
                  </p>
                </div>
              </div>
 
              {contract.description && (
                <div className="mt-4">
                  <p className="text-xs text-gray-400">Descripción</p>
                  <p className="text-sm text-gray-700">{contract.description}</p>
                </div>
              )}
 
              <div className="mt-4">
                <p className="text-xs text-gray-400">Términos</p>
                <p className="mt-1 text-sm text-gray-700 line-clamp-3">
                  {contract.terms}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}