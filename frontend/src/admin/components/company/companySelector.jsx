"use client";

import { useState } from "react";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";

export default function CompanySelector({ companies, loading, onSelect }) {
  const [search, setSearch] = useState("");

  const filtered = companies.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.nit?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        No hay empresas registradas.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-medium text-emerald-900">
        Selecciona la empresa que deseas consultar o actualizar
      </h2>
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <input
          type="text"
          placeholder="Buscar por nombre o NIT…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No se encontraron resultados.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((company) => (
            <button
              key={company.id}
              type="button"
              onClick={() => onSelect(company)}
              className="rounded-xl border border-gray-200 bg-white p-5 text-left transition hover:border-emerald-400 hover:shadow-sm"
            >
              <h3 className="font-semibold text-gray-900">{company.name}</h3>
              <p className="mt-1 text-xs text-gray-500">NIT: {company.nit}</p>
              <p className="mt-2 text-xs text-emerald-600">Ver detalle →</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}