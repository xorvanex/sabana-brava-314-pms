"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllReservations, getAllCompanies } from "@/receptionist/services/receptionist.service";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";

export default function ReservationsView() {
  const [reservations, setReservations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("date-asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [resData, companiesData] = await Promise.all([
          getAllReservations(),
          getAllCompanies(),
        ]);
        setReservations(resData);
        setCompanies(companiesData);
      } catch (e) {
        console.error(e);
        setError(e.message || "No se pudieron obtener las reservas del servidor.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = useMemo(() => {
    const total = reservations.length;
    const confirmed = reservations.filter((r) => r.status === "CONFIRMED").length;
    const checkedIn = reservations.filter((r) => r.status === "CHECKED_IN").length;
    const pending = reservations.filter((r) => r.status === "PENDING").length;
    return { total, confirmed, checkedIn, pending };
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    let list = [...reservations];

    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      list = list.filter((res) => {
        const name = res.company?.name?.toLowerCase() || "";
        const nit = res.company?.nit?.toLowerCase() || "";
        return name.includes(lower) || nit.includes(lower);
      });
    }

    list.sort((a, b) => {
      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);
      if (sortOrder === "date-asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    return list;
  }, [reservations, searchTerm, sortOrder]);

  const getCompanyName = (reservation) => {
    return reservation.company?.name || "Empresa no encontrada";
  };

  const getCompanyNit = (reservation) => {
    return reservation.company?.nit ? `NIT: ${reservation.company.nit}` : "";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/60";
      case "PENDING":
        return "bg-amber-50 text-amber-800 border-amber-200/60";
      case "CANCELLED":
        return "bg-rose-50 text-rose-800 border-rose-200/60";
      case "CHECKED_IN":
        return "bg-blue-50 text-blue-800 border-blue-200/60";
      case "CHECKED_OUT":
      case "COMPLETED":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "NO_SHOW":
        return "bg-orange-50 text-orange-800 border-orange-200/60";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmada";
      case "PENDING":
        return "Pendiente";
      case "CANCELLED":
        return "Cancelada";
      case "CHECKED_IN":
        return "Check-in realizado";
      case "CHECKED_OUT":
      case "COMPLETED":
        return "Check-out realizado";
      case "NO_SHOW":
        return "No show";
      default:
        return status;
    }
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "-";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${day} ${months[monthIndex]} ${year}`;
      }
    }
    return dateStr;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b border-emerald-50 pb-5">
        <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight">
          Consultar Reservas
        </h1>
        <p className="text-sm text-gray-500">
          Visualice, busque y ordene el historial de reservas de empresas asociadas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-100/70 bg-white p-5 shadow-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Reservas</p>
            <p className="text-2xl font-black text-emerald-950">{stats.total}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">En Estadía</p>
            <p className="text-2xl font-black text-blue-950">{stats.checkedIn}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Confirmadas</p>
            <p className="text-2xl font-black text-emerald-950">{stats.confirmed}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pendientes</p>
            <p className="text-2xl font-black text-amber-950">{stats.pending}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 min-w-[280px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar empresa por nombre o NIT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[200px] flex-1 sm:flex-none">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                <option value="date-asc">Fecha más cercana (Crono.)</option>
                <option value="date-desc">Fecha más lejana (Inverso)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-50 pt-4 text-xs text-gray-400">
          <p>
            Mostrando {filteredReservations.length} de {reservations.length} reservas
          </p>
          {searchTerm && (
            <p className="text-emerald-700 font-medium">
              Filtro activo · <button onClick={() => setSearchTerm("")} className="underline hover:text-emerald-900">Limpiar filtros</button>
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex h-40 flex-col items-center justify-center gap-3 text-emerald-800">
            <Spinner className="border-emerald-600 border-t-transparent h-8 w-8" />
            <p className="text-sm font-medium animate-pulse">Cargando reservas...</p>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <svg className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border border-dashed border-slate-100 text-slate-400">
            <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm font-semibold text-slate-500">No se encontraron reservas</p>
            <p className="text-xs text-slate-400 max-w-xs text-center">
              Intente ajustar el término de búsqueda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Empresa</th>
                  <th className="px-6 py-4">Fechas de estadía</th>
                  <th className="px-6 py-4">Habitaciones</th>
                  <th className="px-6 py-4 text-center">Huéspedes</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="group transition duration-150 hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm group-hover:text-emerald-900 transition-colors">
                          {getCompanyName(reservation)}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 mt-0.5">
                          {getCompanyNit(reservation)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-650">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDateLabel(reservation.start_date)}</span>
                        <span className="text-slate-300 font-normal">➔</span>
                        <span>{formatDateLabel(reservation.end_date)}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {reservation.rooms && reservation.rooms.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {reservation.rooms.map((room) => (
                            <span key={room.id} className="inline-flex items-center rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100">
                              Hab. {room.room_number}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Sin asignar</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center text-slate-600 font-semibold">
                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/50 text-xs">
                        <svg className="h-3.5 w-3.5 text-slate-450" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {reservation.guest_count}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(reservation.status)}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                        {getStatusLabel(reservation.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}