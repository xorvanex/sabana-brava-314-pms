"use client";

import { useEffect, useState } from "react";
import { getOwnerSummary } from "@/shared/serviceGlobal/user.services";
import { getAdminSummary } from "@/admin/services/admin.services";
import { useSessionUser } from "@/shared/hooks/useSessionUser";

function MetricCard({ label, value, borderClass, iconBg, iconColor, icon }) {
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border ${borderClass} bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
    >
      <div className="relative flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
          <p className="text-4xl font-extrabold text-gray-800">{value ?? 0}</p>
        </div>
        <div
          className={`rounded-xl p-3 shadow-inner transition-all duration-300 ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>
      </div>
    </article>
  );
}

export default function GlobalDashboard() {
  const [summary, setSummary] = useState(null);
  const [roleType, setRoleType] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useSessionUser();

  const rol = user?.rol || user?.role || "";
  const isOwner = ["OWNER", "DUEÑA", "PROPIETARIO"].includes(rol);
  const isAdmin = ["ADMINISTRADOR", "ADMINISTRATOR"].includes(rol);
  const isReceptionist = ["RECEPTIONIST", "RECEPCIONISTA"].includes(rol);

  useEffect(() => {
    async function loadData() {
      if (isReceptionist && !isOwner && !isAdmin) {
        setSummary(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        if (isAdmin) {
          const data = await getAdminSummary();
          setSummary(data);
          setRoleType("admin");
        } else if (isOwner) {
          const data = await getOwnerSummary();
          setSummary(data);
          setRoleType("owner");
        } else {
          setSummary(null);
        }
      } catch (err) {
        console.error("Error al cargar el resumen:", err);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAdmin, isOwner, isReceptionist]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
        <p className="animate-pulse text-sm font-medium text-emerald-800">Cargando panel...</p>
      </div>
    );
  }

  if (!summary) return null;

  const nombreUsuario = user?.nombre || user?.name || "Usuario";
  const title = isAdmin
    ? "Panel principal - Administrador"
    : isOwner
      ? "Panel principal - Propietario"
      : "Panel principal";

  const docIcon = (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-emerald-50 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-emerald-950">
          ¡Hola, <span className="font-black text-emerald-600">{nombreUsuario}</span>!
        </h1>
        <p className="mt-1 text-sm text-gray-500">{title}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {roleType === "owner" && (
          <>
            <MetricCard
              label="Facturas registradas"
              value={summary.totalFacturas}
              borderClass="border-sky-100/80 hover:border-sky-200"
              iconBg="bg-sky-50 group-hover:bg-sky-600"
              iconColor="text-sky-600 group-hover:text-white"
              icon={docIcon}
            />
            <MetricCard
              label="Contratos activos"
              value={summary.contratosActivos}
              borderClass="border-teal-100/80 hover:border-teal-200"
              iconBg="bg-teal-50 group-hover:bg-teal-600"
              iconColor="text-teal-600 group-hover:text-white"
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <MetricCard
              label="Usuarios activos"
              value={summary.usuariosActivos}
              borderClass="border-emerald-100/80 hover:border-emerald-200"
              iconBg="bg-emerald-50 group-hover:bg-emerald-600"
              iconColor="text-emerald-600 group-hover:text-white"
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
          </>
        )}

        {roleType === "admin" && (
          <>
            <MetricCard
              label="Total habitaciones"
              value={summary.totalHabitaciones}
              borderClass="border-emerald-100/80 hover:border-emerald-200"
              iconBg="bg-emerald-50 group-hover:bg-emerald-600"
              iconColor="text-emerald-600 group-hover:text-white"
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
                </svg>
              }
            />
            <MetricCard
              label="Habitaciones disponibles"
              value={summary.habitacionesDisponibles}
              borderClass="border-teal-100/80 hover:border-teal-200"
              iconBg="bg-teal-50 group-hover:bg-teal-600"
              iconColor="text-teal-600 group-hover:text-white"
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            />
            <MetricCard
              label="Empresas activas"
              value={summary.empresasActivas}
              borderClass="border-violet-100/80 hover:border-violet-200"
              iconBg="bg-violet-50 group-hover:bg-violet-600"
              iconColor="text-violet-600 group-hover:text-white"
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />
            <MetricCard
              label="Usuarios activos"
              value={summary.usuariosActivos}
              borderClass="border-emerald-100/80 hover:border-emerald-200"
              iconBg="bg-emerald-50 group-hover:bg-emerald-600"
              iconColor="text-emerald-600 group-hover:text-white"
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
            <MetricCard
              label="Facturas registradas"
              value={summary.facturasRegistradas}
              borderClass="border-sky-100/80 hover:border-sky-200"
              iconBg="bg-sky-50 group-hover:bg-sky-600"
              iconColor="text-sky-600 group-hover:text-white"
              icon={docIcon}
            />
            <MetricCard
              label="Facturas pendientes de pago"
              value={summary.facturasPendientesPago}
              borderClass="border-amber-100/80 hover:border-amber-200"
              iconBg="bg-amber-50 group-hover:bg-amber-600"
              iconColor="text-amber-600 group-hover:text-white"
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </>
        )}
      </div>
    </div>
  );
}