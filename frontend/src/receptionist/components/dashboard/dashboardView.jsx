"use client";

import { useEffect, useState } from "react";
import { getReceptionistSummary } from "@/receptionist/services/receptionist.service";
import { useSessionUser } from "@/shared/hooks/useSessionUser";

export default function ReceptionistDashboardView() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSessionUser();

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        const data = await getReceptionistSummary();
        setSummary(data);
      } catch (err) {
        console.error(err);
        setError("Error al inicializar el panel de control.");
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, []);

  const nombreUsuario = user?.nombre || "Recepcionista";

  if (loading) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"></div>
        <p className="text-sm font-medium text-emerald-800 animate-pulse">Cargando panel de control...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center shadow-sm">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="mt-2 text-lg font-semibold text-red-800">Error al cargar datos</h3>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1 border-b border-emerald-50 pb-5">
        <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight">
          ¡Hola, <span className="text-emerald-600 font-black">{nombreUsuario}</span>!
        </h1>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Habitaciones Disponibles */}
        <article className="group relative overflow-hidden rounded-2xl border border-emerald-100/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-emerald-50/50 group-hover:scale-110 transition-transform duration-300" />
          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Habitaciones disponibles
              </p>
              <p className="text-4xl font-extrabold text-emerald-800 group-hover:text-emerald-600 transition-colors">
                {summary?.availableRooms ?? 0}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-inner">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </article>

        {/* Huéspedes */}
        <article className="group relative overflow-hidden rounded-2xl border border-teal-100/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-teal-50/50 group-hover:scale-110 transition-transform duration-300" />
          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Huéspedes registrados
              </p>
              <p className="text-4xl font-extrabold text-teal-800 group-hover:text-teal-600 transition-colors">
                {summary?.totalGuests ?? 0}
              </p>
            </div>
            <div className="rounded-xl bg-teal-50 p-3 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-inner">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </article>

        {/* Reservas totales */}
        <article className="group relative overflow-hidden rounded-2xl border border-sky-100/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-sky-200 transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-sky-50/50 group-hover:scale-110 transition-transform duration-300" />
          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Reservas en sistema
              </p>
              <p className="text-4xl font-extrabold text-sky-800 group-hover:text-sky-600 transition-colors">
                {summary?.activeReservations ?? 0}
              </p>
            </div>
            <div className="rounded-xl bg-sky-50 p-3 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300 shadow-inner">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}