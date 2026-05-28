"use client";

import { useEffect, useState } from "react";
import { getOwnerSummary } from "@/owner/services/owner.services";

export default function OwnerDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function loadData() {
      const data = await getOwnerSummary();
      setSummary(data);
    }
    loadData();
  }, []);

  if (!summary) {
    return <p className="text-sm text-gray-500">Cargando dashboard...</p>;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-emerald-900">
        Panel principal - Propietario
      </h1>
      <p className="text-sm text-gray-600">
        Vista general del estado administrativo.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Facturas registradas</p>
          <p className="mt-2 text-2xl font-bold text-emerald-800">
            {summary.totalFacturas}
          </p>
        </article>

        <article className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Contratos activos</p>
          <p className="mt-2 text-2xl font-bold text-emerald-800">
            {summary.contratosActivos}
          </p>
        </article>

        <article className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Usuarios activos</p>
          <p className="mt-2 text-2xl font-bold text-emerald-800">
            {summary.usuariosActivos}
          </p>
        </article>
      </div>
    </section>
  );
}