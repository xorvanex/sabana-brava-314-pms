"use client";

import { useState } from "react";
import { getRoomAvailabilityData } from "@/receptionist/services/receptionist.service";

const NOMBRES_MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function AvailabilityView() {
  const hoy = new Date();
  const unMesDespues = new Date();
  unMesDespues.setDate(hoy.getDate() + 30);

  const formatearFechaInput = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const [fechaInicio, setFechaInicio] = useState(formatearFechaInput(hoy));
  const [fechaFin, setFechaFin] = useState(formatearFechaInput(unMesDespues));
  const [limiteInicio, setLimiteInicio] = useState(null);
  const [limiteFin, setLimiteFin] = useState(null);
  const [mesActivo, setMesActivo] = useState(hoy.getMonth());
  const [anioActivo, setAnioActivo] = useState(hoy.getFullYear());
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [consultado, setConsultado] = useState(false);

  // Estado del tooltip activo
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, reserva: null });

  const handleConsultar = async (e) => {
    if (e) e.preventDefault();
    if (fechaFin < fechaInicio) {
      setError("La fecha de fin debe ser posterior a la fecha de inicio.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { rooms: dbRooms, reservations: dbReservations } = await getRoomAvailabilityData();
      setRooms(dbRooms);
      setReservations(dbReservations);
      setLimiteInicio(fechaInicio);
      setLimiteFin(fechaFin);
      const [startYear, startMonth] = fechaInicio.split("-").map(Number);
      setAnioActivo(startYear);
      setMesActivo(startMonth - 1);
      setConsultado(true);
    } catch (err) {
      console.error(err);
      setError("Error al cargar la disponibilidad. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const obtenerDiasEnMesActivo = () => {
    const cantidadDias = new Date(anioActivo, mesActivo + 1, 0).getDate();
    const dias = [];
    for (let i = 1; i <= cantidadDias; i++) {
      const fechaObj = new Date(anioActivo, mesActivo, i);
      const diaSemana = DIAS_SEMANA[fechaObj.getDay()];
      dias.push({ numero: i, diaSemana });
    }
    return dias;
  };

  const diasDelMes = obtenerDiasEnMesActivo();

  const obtenerLimitesNavegacion = () => {
    if (!limiteInicio || !limiteFin) return { deshabilitarPrev: true, deshabilitarNext: true };
    const [startYear, startMonth] = limiteInicio.split("-").map(Number);
    const [endYear, endMonth] = limiteFin.split("-").map(Number);
    const mesInicioJS = startMonth - 1;
    const mesFinJS = endMonth - 1;
    const deshabilitarPrev = anioActivo === startYear && mesActivo === mesInicioJS;
    const deshabilitarNext = anioActivo === endYear && mesActivo === mesFinJS;
    return { deshabilitarPrev, deshabilitarNext };
  };

  const { deshabilitarPrev, deshabilitarNext } = obtenerLimitesNavegacion();

  const handlePrevMonth = () => {
    if (deshabilitarPrev) return;
    if (mesActivo === 0) { setMesActivo(11); setAnioActivo(anioActivo - 1); }
    else setMesActivo(mesActivo - 1);
  };

  const handleNextMonth = () => {
    if (deshabilitarNext) return;
    if (mesActivo === 11) { setMesActivo(0); setAnioActivo(anioActivo + 1); }
    else setMesActivo(mesActivo + 1);
  };

  const verificarEstadoDia = (room, diaNumero) => {
    const mm = String(mesActivo + 1).padStart(2, "0");
    const dd = String(diaNumero).padStart(2, "0");
    const fechaString = `${anioActivo}-${mm}-${dd}`;
    if (fechaString < limiteInicio || fechaString > limiteFin) return { estado: "out-of-range" };
    const reservaSolapada = reservations.find((res) => {
      const tieneHabitacion = res.rooms?.some((r) => r.id === room.id);
      if (!tieneHabitacion) return false;
      return fechaString >= res.start_date && fechaString < res.end_date;
    });
    if (reservaSolapada) return { estado: "reserved", reserva: reservaSolapada };
    return { estado: "available" };
  };

  const handleMouseEnterCell = (e, reserva) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      // Centrado horizontalmente sobre la celda, justo encima
      x: rect.left + rect.width / 2,
      y: rect.top,
      reserva,
    });
  };

  const handleMouseLeaveCell = () => {
    setTooltip({ visible: false, x: 0, y: 0, reserva: null });
  };

  return (
    <div className="space-y-6">

      {tooltip.visible && tooltip.reserva && (
        <div
          className="fixed z-[9999] bg-gray-900 text-white rounded-lg p-3 text-xs w-52 shadow-2xl pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateX(-50%) translateY(calc(-100% - 10px))",
          }}
        >
          <div className="font-extrabold text-emerald-400 border-b border-gray-800 pb-1 mb-1">
            {tooltip.reserva.company?.name || "Reserva Registrada"}
          </div>
          <div className="space-y-0.5 font-medium text-gray-300">
            <div>📅 Entrada: {tooltip.reserva.start_date}</div>
            <div>📅 Salida: {tooltip.reserva.end_date}</div>
            <div>👥 Huéspedes: {tooltip.reserva.guest_count}</div>
            <div>📌 Estado: {tooltip.reserva.status}</div>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}

      <div className="border-b border-emerald-50 pb-5">
        <h1 className="text-3xl font-extrabold text-emerald-900 tracking-tight">
          Consultar Disponibilidad
        </h1>
      </div>

      <form onSubmit={handleConsultar} className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-5 shadow-inner">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold tracking-wider text-emerald-900 uppercase">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
              className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-950 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold tracking-wider text-emerald-900 uppercase">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
              className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-emerald-950 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 flex items-center justify-center gap-2 h-11"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            Consultar Rango
          </button>
        </div>
        {error && (
          <p className="mt-3 text-xs font-semibold text-red-600 flex items-center gap-1">
            ⚠️ {error}
          </p>
        )}
      </form>

      
      {consultado && !loading && (
        <div className="space-y-4">

        
          <div className="flex items-center justify-between bg-emerald-800 text-white rounded-xl p-4 shadow-md">
            <button
              onClick={handlePrevMonth}
              disabled={deshabilitarPrev}
              className="rounded-lg p-2 hover:bg-emerald-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Mes Anterior"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-black tracking-wide">
              {NOMBRES_MESES[mesActivo]} {anioActivo}
            </h2>
            <button
              onClick={handleNextMonth}
              disabled={deshabilitarNext}
              className="rounded-lg p-2 hover:bg-emerald-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Mes Siguiente"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        
          <div className="overflow-x-auto rounded-2xl border border-emerald-100 shadow-sm bg-white">
            <table className="w-full border-collapse text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-emerald-100 bg-emerald-50/40">
                  <th className="sticky left-0 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-950 uppercase w-48 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    Habitación
                  </th>
                  {diasDelMes.map((dia) => {
                    const esFinSemana = dia.diaSemana === "Sáb" || dia.diaSemana === "Dom";
                    return (
                      <th
                        key={dia.numero}
                        className={`text-center py-2 text-xs font-bold border-r border-emerald-50/50 w-10 ${
                          esFinSemana ? "bg-amber-50/30 text-amber-900" : "text-emerald-900"
                        }`}
                      >
                        <div className="text-[10px] uppercase font-semibold text-gray-400">
                          {dia.diaSemana}
                        </div>
                        <div className="text-sm font-black">{String(dia.numero).padStart(2, "0")}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rooms.length === 0 ? (
                  <tr>
                    <td colSpan={diasDelMes.length + 1} className="text-center py-8 text-sm font-medium text-gray-500">
                      No hay habitaciones activas registradas en el sistema.
                    </td>
                  </tr>
                ) : (
                  rooms.map((room) => (
                    <tr key={room.id} className="border-b border-emerald-50 hover:bg-emerald-50/10 transition-colors">
                      <td className="sticky left-0 bg-white px-4 py-3.5 font-semibold text-emerald-950 border-r border-emerald-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">Hab. {room.room_number}</span>
                          <span className="text-[11px] font-medium text-gray-400">Capacidad: 👤 {room.capacity}</span>
                        </div>
                      </td>

                      {diasDelMes.map((dia) => {
                        const { estado, reserva } = verificarEstadoDia(room, dia.numero);

                        if (estado === "out-of-range") {
                          return (
                            <td
                              key={dia.numero}
                              className="bg-gray-50 border-r border-emerald-50/30 p-1 text-center"
                              title="Fecha fuera del rango de búsqueda"
                            >
                              <div className="h-7 w-7 mx-auto rounded bg-gray-100 border border-gray-200/50" />
                            </td>
                          );
                        }

                        if (estado === "reserved") {
                          return (
                            <td
                              key={dia.numero}
                              className="border-r border-emerald-50/30 p-1 text-center"
                              onMouseEnter={(e) => handleMouseEnterCell(e, reserva)}
                              onMouseLeave={handleMouseLeaveCell}
                            >
                              <div className="h-7 w-7 mx-auto rounded bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-800 text-[10px] font-black cursor-pointer shadow-sm">
                                OCU
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td key={dia.numero} className="border-r border-emerald-50/30 p-1 text-center">
                            <div className="h-7 w-7 mx-auto rounded bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 text-[10px] font-black shadow-sm">
                              DIS
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

      
          <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500 bg-gray-50 rounded-xl p-4 border border-gray-150">
            <span className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 text-[8px] font-black">DIS</span> Disponible
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-800 text-[8px] font-black">OCU</span> Ocupado / Reservado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded bg-gray-100 border border-gray-200 flex" /> Fuera del Rango de Búsqueda
            </span>
          </div>

        </div>
      )}
    </div>
  );
}