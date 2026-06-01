"use client";
 
import { useEffect, useState } from "react";
import { useContracts } from "@/owner/hooks/useContracts";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";
 
function OilRigIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base platform */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2 20h20" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 20v-3h16v3" />
      {/* Legs */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 17v-2M12 17v-2M18 17v-2" />
      {/* Derrick tower */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 15L12 4l3 11" />
      {/* Cross braces */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.8 12.5l4.4-5M14.2 12.5l-4.4-5" />
      {/* Top crown */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.5 4h3" />
      {/* Drill pipe */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v-2" />
      {/* Pump jack arm */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 14h4" />
      <circle cx="5" cy="14" r="1" strokeWidth={1.8} />
    </svg>
  );
}
 
export default function CompanySelector({ onSelect }) {
  const { companies, loading, error, loadCompanies } = useContracts();
  const [search, setSearch] = useState("");
 
  useEffect(() => {
    loadCompanies();
  }, []);
 
  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nit.toLowerCase().includes(search.toLowerCase())
  );
 
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
 
  if (companies.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">No hay empresas registradas</p>
      </div>
    );
  }
 
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-emerald-900">
          Seleccionar empresa
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
          placeholder="Buscar empresa por nombre o NIT…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
      </div>
 
      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            No se encontraron empresas para "{search}"
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((company) => (
            <button
              key={company.id}
              onClick={() => onSelect(company)}
              className="group rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-emerald-400 hover:shadow-sm"
            >
              {/* Oil rig icon */}
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <OilRigIcon className="h-6 w-6" />
              </div>
 
              {/* Info */}
              <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700">
                {company.name}
              </h3>
              <p className="mt-1 text-xs text-gray-400">NIT: {company.nit}</p>
              {company.company_representative && (
                <p className="mt-0.5 text-xs text-gray-500">
                  Representante legal: {company.company_representative}
                </p>
              )}
 
              {/* CTA */}
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
                Crear contrato
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
 