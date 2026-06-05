// src/receptionist/components/reservation/GuestAssignment.jsx
"use client";

import { useState, useEffect } from "react";

export default function GuestAssignment({ rooms, guests, setGuests }) {
  const [assignments, setAssignments] = useState(() => {
    const init = {};
    rooms.forEach((id) => (init[id] = []));
    return init;
  });

  const handleAssign = (roomId, guestId) => {
    setAssignments((prev) => {
      const aux = { ...prev };
      if (!aux[roomId].includes(guestId) && aux[roomId].length < 2) {
        aux[roomId].push(guestId);
      }
      return aux;
    });
  };

  const handleUnassign = (roomId, guestId) => {
    setAssignments((prev) => {
      const aux = { ...prev };
      aux[roomId] = aux[roomId].filter((id) => id !== guestId);
      return aux;
    });
  };

  useEffect(() => {
    const selectedIds = Object.values(assignments).flat();
    const selectedObjs = guests.filter((g) => selectedIds.includes(g.id));
    setGuests((prev) => {
      const prevIds = prev.map((g) => g.id).sort();
      const newIds = selectedObjs.map((g) => g.id).sort();
      const isSame =
        prevIds.length === newIds.length && prevIds.every((id, i) => id === newIds[i]);
      return isSame ? prev : selectedObjs;
    });
  }, [assignments]);

  return (
    <div className="space-y-3 border-t border-emerald-100 pt-4 mt-2">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Asignación por habitación
        </p>
        <p className="text-xs text-gray-400 mt-0.5">Máximo 2 huéspedes por habitación</p>
      </div>

      {rooms.map((roomId) => {
        const assigned = assignments[roomId] || [];
        const isFull = assigned.length >= 2;

        return (
          <div
            key={roomId}
            className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden"
          >
            {/* Header de la habitación */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-2.5">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm font-semibold text-gray-800">Habitación {roomId}</span>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                isFull
                  ? "bg-amber-100 text-amber-700"
                  : assigned.length > 0
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {assigned.length}/2
              </span>
            </div>

            <div className="p-3 space-y-2">
              {/* Huéspedes disponibles para asignar */}
              {!isFull && (
                <div className="flex flex-wrap gap-1.5">
                  {guests
                    .filter((g) => !assigned.includes(g.id))
                    .map((g) => (
                      <button
                        key={g.id}
                        onClick={() => handleAssign(roomId, g.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-dashed border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        {g.first_name} {g.last_name}
                      </button>
                    ))}
                  {guests.filter((g) => !assigned.includes(g.id)).length === 0 && (
                    <p className="text-xs text-gray-400 italic">Todos los huéspedes ya están asignados</p>
                  )}
                </div>
              )}

              {/* Huéspedes asignados */}
              {assigned.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {assigned.map((guestId) => {
                    const guest = guests.find((x) => x.id === guestId);
                    return (
                      <div
                        key={guestId}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-100 border border-emerald-200 pl-2.5 pr-1.5 py-1.5"
                      >
                        <span className="text-xs font-semibold text-emerald-800">
                          {guest?.first_name} {guest?.last_name}
                        </span>
                        <button
                          onClick={() => handleUnassign(roomId, guestId)}
                          className="flex h-4 w-4 items-center justify-center rounded-full text-emerald-600 hover:bg-emerald-200 hover:text-red-600 transition-colors"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {assigned.length === 0 && isFull === false && guests.length === 0 && (
                <p className="text-xs text-gray-400 italic">No hay huéspedes disponibles</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}