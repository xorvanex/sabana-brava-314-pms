"use client";

import { useEffect, useState, useMemo } from "react";
import AdminErrorModal from "@/admin/components/ui/AdminErrorModal";
import { useAdminErrorModal } from "@/admin/hooks/useAdminErrorModal";
import { useRooms } from "@/admin/hooks/useRooms";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";

const ROOM_STATUSES = [
  { value: "AVAILABLE", label: "Disponible" },
  { value: "OCCUPIED", label: "Ocupada" },
  { value: "BLOCKED", label: "Bloqueada" },
  { value: "MAINTENANCE", label: "Mantenimiento" },
  { value: "OUT_OF_SERVICE", label: "Fuera de servicio" },
];

export default function RoomStatusView() {
  const { rooms, loading, error, handleUpdateStatus } = useRooms();
  const { errorModal, showError, closeError } = useAdminErrorModal();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (error) showError(error);
  }, [error, showError]);

  const onStatusChange = async (roomId, newStatus) => {
    const room = rooms.find((r) => r.id === roomId);
    try {
      await handleUpdateStatus(roomId, newStatus);
    } catch (err) {
      showError(err instanceof Error ? err.message : "No se pudo cambiar el estado.", {
        numero: room?.room_number,
      });
    }
  };

  // Filter and search logic
  const filteredRooms = useMemo(() => {
    let list = [...rooms];

    // Search by room number or description
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.room_number.toLowerCase().includes(term) ||
          (r.description && r.description.toLowerCase().includes(term))
      );
    }

    // Filter by room status
    if (statusFilter !== "ALL") {
      list = list.filter((r) => r.status === statusFilter);
    }

    return list;
  }, [rooms, searchTerm, statusFilter]);

  // Color mappings for modern UI cards
  const getStatusColorConfig = (status) => {
    switch (status) {
      case "AVAILABLE":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-100",
          dot: "bg-emerald-500",
        };
      case "OCCUPIED":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-100",
          dot: "bg-blue-500",
        };
      case "BLOCKED":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-100",
          dot: "bg-amber-500",
        };
      case "MAINTENANCE":
        return {
          bg: "bg-orange-50",
          text: "text-orange-700",
          border: "border-orange-100",
          dot: "bg-orange-500",
        };
      case "OUT_OF_SERVICE":
        return {
          bg: "bg-rose-50",
          text: "text-rose-700",
          border: "border-rose-100",
          dot: "bg-rose-500",
        };
      default:
        return {
          bg: "bg-slate-50",
          text: "text-slate-700",
          border: "border-slate-100",
          dot: "bg-slate-500",
        };
    }
  };

  return (
    <section className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-emerald-950">
          Gestionar Estado de Habitación
        </h1>
        <p className="text-sm text-gray-500">
          Supervise y actualice el estado operativo y de disponibilidad de cada habitación en tiempo real.
        </p>
      </div>

      {/* Control panel: search + quick filters */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por N° de habitación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600"
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

          {/* Helper total text */}
          <p className="text-xs text-gray-500 font-medium self-end md:self-auto">
            Mostrando {filteredRooms.length} de {rooms.length} habitaciones
          </p>
        </div>

        {/* Quick status filter buttons (pills) */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 border border-slate-200/50 hover:bg-slate-100"
            }`}
          >
            Todas
          </button>
          {ROOM_STATUSES.map(({ value, label }) => {
            const config = getStatusColorConfig(value);
            const isActive = statusFilter === value;
            return (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer border ${
                  isActive
                    ? `${config.bg} ${config.text} ${config.border} ring-1 ring-current`
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`}></span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main room display */}
      {loading ? (
        <div className="flex h-32 flex-col items-center justify-center gap-3 text-slate-400">
          <Spinner />
          <p className="text-sm">Cargando habitaciones...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-100 p-8 text-center text-slate-400">
          <svg className="h-10 w-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="text-sm font-medium">No se encontraron habitaciones</p>
          <p className="text-xs text-slate-400 max-w-sm">
            Pruebe ajustando el filtro de estado o modifique los términos de búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredRooms.map((room) => {
            const config = getStatusColorConfig(room.status);
            const statusLabel = ROOM_STATUSES.find((s) => s.value === room.status)?.label || room.status;

            return (
              <div
                key={room.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-slate-200/60"
              >
                <div className="space-y-3">
                  
                  {/* Card Header: Room Number and Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-800 text-base leading-none">
                      Habitación {room.room_number}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${config.bg} ${config.text} ${config.border}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`}></span>
                      {statusLabel}
                    </span>
                  </div>

                  {/* Card Body: Details */}
                  <div className="space-y-1">
                    {room.capacity && (
                      <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Capacidad: {room.capacity} {room.capacity === 1 ? "persona" : "personas"}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 line-clamp-2 h-8" title={room.description}>
                      {room.description || "Sin descripción adicional."}
                    </p>
                  </div>
                </div>

                {/* Dropdown status switcher */}
                <div className="mt-4 pt-3 border-t border-slate-50">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Cambiar Estado
                  </label>
                  <select
                    value={room.status}
                    onChange={(e) => onStatusChange(room.id, e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                  >
                    {ROOM_STATUSES.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            );
          })}
        </div>
      )}

      <AdminErrorModal open={!!errorModal} onClose={closeError} {...errorModal} />
    </section>
  );
}