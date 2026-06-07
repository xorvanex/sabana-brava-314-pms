"use client";

import { useEffect, useState, useRef } from "react";
import { useCreateContract } from "@/owner/hooks/useContracts";
import { getCompanyContracts, getAllRooms, getActiveContracts } from "@/owner/services/owner.service";
import Button from "@/shared/globalComponents/ui/button/Button";
import Input from "@/shared/globalComponents/ui/input/Input";

export default function ContractForm({ company, onBack, onPreviewGenerated }) {
  const { formData, handleChange, error, setFormData, handleFieldChange } = useCreateContract();
  const [checkingOverlap, setCheckingOverlap] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [isRoomsOpen, setIsRoomsOpen] = useState(false);
  const [activeContracts, setActiveContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [conflictModal, setConflictModal] = useState({ open: false, rooms: [] });
    const [overlapModal, setOverlapModal] = useState(null);
  const isLoadingRooms = useRef(false);
  const isLoadingContracts = useRef(false);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, companyId: company.id }));
  }, [company.id]);

  useEffect(() => {
    const loadRooms = async () => {
      if (isLoadingRooms.current) return;
      isLoadingRooms.current = true;
      try {
        setLoadingRooms(true);
        const data = await getAllRooms();
        setRooms(data);
      } catch (err) {
        console.error("Error al cargar habitaciones:", err);
      } finally {
        setLoadingRooms(false);
        isLoadingRooms.current = false;
      }
    };
    loadRooms();
  }, []);

  useEffect(() => {
    const loadActiveContracts = async () => {
      if (isLoadingContracts.current) return;
      isLoadingContracts.current = true;
      try {
        setLoadingContracts(true);
        const data = await getActiveContracts();
        setActiveContracts(data);
      } catch (err) {
        console.error("Error al cargar contratos activos:", err);
      } finally {
        setLoadingContracts(false);
        isLoadingContracts.current = false;
      }
    };
    loadActiveContracts();
  }, []);

  const occupiedRoomIds = activeContracts.flatMap(contract =>
    contract.rooms ? contract.rooms.map(room => room.id) : []
  );

  const availableRooms = rooms.filter(room =>
    !occupiedRoomIds.includes(room.id) && room.status === "AVAILABLE"
  );

  const checkRoomAvailability = async () => {
    if (!formData.startDate || !formData.endDate || !formData.roomIds || formData.roomIds.length === 0) {
      return true;
    }

    try {
      const contracts = await getActiveContracts();
      const newStart = new Date(formData.startDate);
      const newEnd = new Date(formData.endDate);
      const occupiedRooms = [];

      for (const contract of contracts) {
        const contractStart = new Date(contract.start_date);
        const contractEnd = new Date(contract.end_date);
        const hasOverlap = (newStart <= contractEnd && newEnd >= contractStart);

        if (hasOverlap && contract.rooms) {
          const contractRoomIds = contract.rooms.map(room => room.id);
          const overlappingRooms = formData.roomIds.filter(roomId =>
            contractRoomIds.includes(roomId)
          );

          if (overlappingRooms.length > 0) {
            overlappingRooms.forEach(roomId => {
              const room = rooms.find(r => r.id === roomId);
              if (room && !occupiedRooms.includes(room.room_number)) {
                occupiedRooms.push(room.room_number);
              }
            });
          }
        }
      }

      if (occupiedRooms.length > 0) {
        setConflictModal({ open: true, rooms: occupiedRooms });
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error al verificar disponibilidad de habitaciones:", err);
      alert("Error al verificar disponibilidad de habitaciones. Por favor, intente nuevamente.");
      return false;
    }
  };

    const checkContractOverlap = async () => {
    if (!formData.startDate || !formData.endDate) return null;

    try {
      setCheckingOverlap(true);
      const contracts = await getCompanyContracts(company.id);
      const newStart = new Date(formData.startDate);
      const newEnd = new Date(formData.endDate);

      for (const contract of contracts) {
        if (!contract.is_active) continue;
        const existingStart = new Date(contract.start_date);
        const existingEnd = new Date(contract.end_date);
        if (newStart <= existingEnd && newEnd >= existingStart) {
          return contract; // Retornamos el contrato con conflicto
        }
      }

      return null;
    } catch (err) {
      console.error("Error al verificar superposición:", err);
      return null;
    } finally {
      setCheckingOverlap(false);
    }
  };

  const handleRoomToggle = (roomId) => {
    const currentRoomIds = formData.roomIds || [];
    if (currentRoomIds.includes(roomId)) {
      handleFieldChange("roomIds", currentRoomIds.filter(id => id !== roomId));
    } else {
      handleFieldChange("roomIds", [...currentRoomIds, roomId]);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (formData.terms.length < 10) {
      alert("Los términos y condiciones deben tener al menos 10 caracteres");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      alert("Debes seleccionar ambas fechas");
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      alert("La fecha de fin debe ser mayor que la fecha de inicio");
      return;
    }

    const overlappingContract = await checkContractOverlap();
    if (overlappingContract) {
      setOverlapModal(overlappingContract); // Guardamos el objeto del contrato en el modal
      return;
    }

    const roomsAvailable = await checkRoomAvailability();
    if (!roomsAvailable) {
      return;
    }

    try {
      onPreviewGenerated(formData);
    } catch (err) {
      alert("Error al generar preview: " + err.message);
    }
  };

  return (
    <div className="space-y-6">

      {/* Modal: fechas superpuestas en contrato de la empresa */}
      {overlapModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && setOverlapModal(null)}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center gap-3 bg-red-700 px-6 py-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-base font-medium text-white">Conflicto de fechas</p>
                <p className="text-sm text-red-200">La empresa ya tiene un contrato activo</p>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="mb-4 text-sm text-gray-600">
                Las fechas seleccionadas se superponen con un contrato activo de la misma empresa:
              </p>

              <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-900">{company.name}</p>
                  <p className="text-xs text-red-700 mt-1">
                    Contrato vigente: {overlapModal.start_date} al {overlapModal.end_date}
                  </p>
                </div>
              </div>

              <p className="mb-5 text-sm text-gray-500">
                Por favor, selecciona un rango de fechas que no se superponga con contratos existentes.
              </p>

              <button
                onClick={() => setOverlapModal(null)}
                className="w-full rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-800"
              >
                Entendido, volver al formulario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: habitaciones ocupadas en el rango de fechas */}
      {conflictModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && setConflictModal({ open: false, rooms: [] })}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center gap-3 bg-red-700 px-6 py-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <p className="text-base font-medium text-white">No es posible crear el contrato</p>
                <p className="text-sm text-red-200">Conflicto de disponibilidad detectado</p>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="mb-4 text-sm text-gray-600">
                Las siguientes habitaciones ya están ocupadas en el rango de fechas seleccionado:
              </p>

              <div className="mb-5 flex flex-col gap-2">
                {conflictModal.rooms.map((roomNumber) => (
                  <div
                    key={roomNumber}
                    className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5"
                  >
                    <svg className="h-5 w-5 flex-shrink-0 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-sm font-medium text-red-900">Habitación {roomNumber}</span>
                  </div>
                ))}
              </div>

              <p className="mb-5 text-sm text-gray-500">
                Por favor, selecciona otras habitaciones o cambia el rango de fechas.
              </p>

              <button
                onClick={() => setConflictModal({ open: false, rooms: [] })}
                className="w-full rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-800"
              >
                Entendido, volver al formulario
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-emerald-900">
            Crear contrato
          </h2>
          <p className="text-sm text-gray-600">
            Empresa: {company.name}
          </p>
        </div>
        <button
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Volver
        </button>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="Fecha de inicio"
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />

            <Input
              label="Fecha de fin"
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
            />

            <Input
              label="Tarifa mensual por habitacion"
              id="baseRate"
              name="baseRate"
              type="number"
              step="0.01"
              value={formData.baseRate}
              onChange={handleChange}
              placeholder="0.00"
              required
            />

            <Input
              label="Descripción"
              id="description"
              name="description"
              type="text"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalles adicionales del contrato"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Seleccionar habitaciones
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRoomsOpen(!isRoomsOpen)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-sm text-gray-700 hover:border-emerald-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {loadingRooms ? (
                  "Cargando habitaciones..."
                ) : formData.roomIds && formData.roomIds.length > 0 ? (
                  `${formData.roomIds.length} habitación(es) seleccionada(s)`
                ) : (
                  "Seleccionar habitaciones..."
                )}
                <svg
                  className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 transition ${isRoomsOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isRoomsOpen && !loadingRooms && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                  {rooms.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No hay habitaciones disponibles
                    </div>
                  ) : (
                    rooms.map((room) => (
                      <label
                        key={room.id}
                        className="flex cursor-pointer items-center space-x-3 px-4 py-3 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={formData.roomIds?.includes(room.id) || false}
                          onChange={() => handleRoomToggle(room.id)}
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Habitación {room.room_number}
                          </p>
                          {room.description && (
                            <p className="text-xs text-gray-500">{room.description}</p>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Términos y condiciones del contrato <span className="text-red-500">*</span>
            </label>
            <textarea
              name="terms"
              value={formData.terms}
              onChange={handleChange}
              rows={8}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="Escribe los términos y condiciones del contrato aquí (mínimo 10 caracteres)..."
              required
            />
            {formData.terms.length > 0 && formData.terms.length < 10 && (
              <p className="mt-1 text-sm text-red-600">
                Debes escribir al menos 10 caracteres ({formData.terms.length}/10)
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={formData.terms.length < 10 || !formData.startDate || !formData.endDate || checkingOverlap}
            className="w-full"
          >
            {checkingOverlap ? "Verificando disponibilidad..." : "Generar preview del contrato"}
          </Button>
        </form>
      </div>
    </div>
  );
}