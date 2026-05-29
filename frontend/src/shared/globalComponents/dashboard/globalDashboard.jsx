"use client";

import { useEffect, useState } from "react";
import { getOwnerSummary } from "@/shared/serviceGlobal/user.services";
import { useSessionUser } from "@/shared/hooks/useSessionUser";

export default function GlobalDashboard() {
  const [summary, setSummary] = useState(null);
  const user = useSessionUser();

  useEffect(() => {
    async function loadData() {
      const data = await getOwnerSummary();
      setSummary(data);
    }
    loadData();
  }, []);

  // Si no tiene permisos (summary es null), no mostrar nada
  if (!summary) {
    return null;
  }

  const rol = user?.rol || user?.role || "";
  const isOwner = rol === "OWNER" || rol === "DUEÑA";
  const isAdmin = rol === "ADMINISTRADOR";

  // Título según rol
  const getTitle = () => {
    if (isOwner) return "Panel principal - Propietario";
    if (isAdmin) return "Panel principal - Administrador";
    return "Panel principal";
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-emerald-900">
        {getTitle()}
      </h1>
      <p className="text-sm text-gray-600">
        Vista general del estado administrativo.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Facturas - visible para owner y admin */}
        {(isOwner || isAdmin) && (
          <article className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Facturas registradas</p>
            <p className="mt-2 text-2xl font-bold text-emerald-800">
              {summary.totalFacturas}
            </p>
          </article>
        )}

        {/* Contratos - solo visible para owner */}
        {isOwner && summary.contratosActivos !== null && (
          <article className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Contratos activos</p>
            <p className="mt-2 text-2xl font-bold text-emerald-800">
              {summary.contratosActivos}
            </p>
          </article>
        )}

        {/* Usuarios - visible para owner y admin */}
        {(isOwner || isAdmin) && (
          <article className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Usuarios activos</p>
            <p className="mt-2 text-2xl font-bold text-emerald-800">
              {summary.usuariosActivos}
            </p>
          </article>
        )}
      </div>
    </section>
  );
}
