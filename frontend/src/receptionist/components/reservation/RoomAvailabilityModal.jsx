
"use client";

import { useEffect, useState } from "react";
import {
  getAllRooms,
  getActiveReservations,
} from "@/receptionist/services/receptionist.service";

export default function RoomAvailabilityModal({
  startDate,
  endDate,
  onSelectRooms,
  isOpen,
  onClose,
  contractRooms = [],
}) {
  const [rooms, setRooms] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setSelected(new Set());
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [allRooms, activeRes] = await Promise.all([
          getAllRooms(),
          getActiveReservations(),
        ]);
        
        // IDs de habitaciones permitidas del contrato
        const contractRoomIds = new Set(contractRooms.map(r => r.id));
        
        const freeRooms = allRooms.filter((room) => {
          // Solo mostrar habitaciones que están en el contrato
          if (!contractRoomIds.has(room.id)) return false;
          
          if (room.status !== "AVAILABLE" || !room.is_active) return false;
          const conflict = activeRes.some((res) => {
            const overlaps = !(res.end_date <= startDate || res.start_date >= endDate);
            if (!overlaps) return false;
            return res.rooms?.some((r) => r.id === room.id);
          });
          return !conflict;
        });
        setRooms(freeRooms);
      } catch (e) {
        console.error(e);
        setError("Error al calcular disponibilidad.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isOpen, startDate, endDate, contractRooms]);

  const toggleRoom = (roomId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  };

  const handleConfirm = () => {
    const selectedRoomObjects = rooms.filter((r) => selected.has(r.id));
    onSelectRooms(selectedRoomObjects);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between bg-emerald-800 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-white">Habitaciones disponibles</h2>
            <p className="text-xs text-emerald-300 mt-0.5">
              {startDate} → {endDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-300 hover:bg-emerald-700 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              <p className="text-sm text-gray-500">Buscando habitaciones…</p>
            </div>
          ) : error ? (
            <p className="text-center text-sm text-red-600 py-8">{error}</p>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <p className="text-sm font-medium text-gray-500">No hay habitaciones libres en ese rango de fechas.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rooms.map((room) => {
                const isSelected = selected.has(room.id);
                return (
                  <label
                    key={room.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border-2 px-4 py-3 transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-100 bg-gray-50 hover:border-emerald-200 hover:bg-emerald-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${
                        isSelected ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}>
                        {room.room_number}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Habitación {room.room_number}
                        </p>
                        <p className="text-xs text-gray-500">
                          Capacidad: {room.capacity} persona{room.capacity > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRoom(room.id)}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <p className="text-xs text-gray-500">
            {selected.size > 0
              ? `${selected.size} habitación${selected.size > 1 ? "es" : ""} seleccionada${selected.size > 1 ? "s" : ""}`
              : "Ninguna seleccionada"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={selected.size === 0}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Confirmar selección
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}