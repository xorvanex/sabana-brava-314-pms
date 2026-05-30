"use client";

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

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-emerald-900">
        Gestionar estado de habitación
      </h1>
      <p className="text-sm text-gray-600">
        Cambia el estado operativo de cada habitación.
      </p>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Spinner />
          Cargando habitaciones...
        </p>
      ) : rooms.length === 0 ? (
        <p className="text-sm text-gray-500">No hay habitaciones registradas.</p>
      ) : (
        <ul className="space-y-3">
          {rooms.map((room) => (
            <li
              key={room.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-medium text-emerald-900">Habitación {room.room_number}</p>
                <p className="text-sm text-gray-500">{room.description || "Sin descripción"}</p>
              </div>
              <select
                value={room.status}
                onChange={(e) => handleUpdateStatus(room.id, e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {ROOM_STATUSES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}