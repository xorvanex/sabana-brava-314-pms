"use client";

import { useEffect, useState } from "react";
import { getOwnerSummary } from "@/shared/serviceGlobal/user.services";
import { useSessionUser } from "@/shared/hooks/useSessionUser";

export default function GlobalDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useSessionUser();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getOwnerSummary();
        setSummary(data);
      } catch (err) {
        console.error("Error al cargar el resumen administrativo:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"></div>
        <p className="text-sm font-medium text-emerald-800 animate-pulse">Cargando datos administrativos...</p>
      </div>
    );
  }

  // Si no tiene permisos (summary es null), no mostrar nada
  if (!summary) {
    return null;
  }

  const rol = user?.rol || user?.role || "";
  const isOwner = rol === "OWNER" || rol === "DUEÑA";
  const isAdmin = rol === "ADMINISTRADOR" || rol === "ADMINISTRATOR";

  // Título según rol
  const getTitle = () => {
    if (isOwner) return "Panel principal - Propietario";
    if (isAdmin) return "Panel principal - Administrador";
    return "Panel principal";
  };

  const nombreUsuario = user?.nombre || "Usuario";

  return (
    <div className="space-y-6">
      {/* Saludo de bienvenida */}
      <div className="flex flex-col space-y-1 border-b border-emerald-50 pb-5">
        <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight">
          ¡Hola, <span className="text-emerald-600 font-black">{nombreUsuario}</span>!
        </h1>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Facturas - visible para owner y admin */}
        {(isOwner || isAdmin) && (
          <article className="group relative overflow-hidden rounded-2xl border border-sky-100/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-sky-200 transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-sky-50/50 group-hover:scale-110 transition-transform duration-300" />
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                  Facturas registradas
                </p>
                <p className="text-4xl font-extrabold text-sky-800 group-hover:text-sky-600 transition-colors">
                  {summary.totalFacturas}
                </p>
              </div>
              <div className="rounded-xl bg-sky-50 p-3 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300 shadow-inner">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </article>
        )}

        {/* Contratos - solo visible para owner */}
        {isOwner && summary.contratosActivos !== null && (
          <article className="group relative overflow-hidden rounded-2xl border border-teal-100/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-teal-50/50 group-hover:scale-110 transition-transform duration-300" />
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                  Contratos activos
                </p>
                <p className="text-4xl font-extrabold text-teal-800 group-hover:text-teal-600 transition-colors">
                  {summary.contratosActivos}
                </p>
              </div>
              <div className="rounded-xl bg-teal-50 p-3 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-inner">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </article>
        )}

        {/* Usuarios - visible para owner, admin y receptionist */}
        {(isOwner || isAdmin || isReceptionist) && (
          <article className="group relative overflow-hidden rounded-2xl border border-emerald-100/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-emerald-50/50 group-hover:scale-110 transition-transform duration-300" />
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                  Usuarios activos
                </p>
                <p className="text-4xl font-extrabold text-emerald-800 group-hover:text-emerald-600 transition-colors">
                  {summary.usuariosActivos}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-inner">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}