"use client";

import { useEffect, useState } from "react";
import { getAdminSummary } from "@/admin/services/admin.services";

const STAT_CARDS = [
  { key: "totalHabitaciones",       label: "Total habitaciones" },
  { key: "habitacionesDisponibles", label: "Habitaciones disponibles" },
  { key: "totalEmpresas",           label: "Empresas registradas" },
  { key: "empresasActivas",         label: "Empresas activas" },
  { key: "facturasRegistradas",     label: "Facturas registradas" },
];

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function loadData() {
      const data = await getAdminSummary();
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
        Panel principal - Administrador
      </h1>
      <p className="text-sm text-gray-600">
        Resumen de habitaciones, empresas y facturación.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {STAT_CARDS.map(({ key, label }) => (
          <article
            key={key}
            className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-emerald-800">
              {summary[key]}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

