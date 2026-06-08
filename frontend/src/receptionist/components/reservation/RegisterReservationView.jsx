
"use client";
import { useState, useEffect } from "react";
import {
  getAllGuests,
  createGuest,
  createReservation,
  getAllCompanies,
  getCompanyContracts,
  assignGuestsToReservation,
  createRoomAssignment,
} from "@/receptionist/services/receptionist.service";
import GuestSearchCreate from "./GuestSearchCreate";
import RoomAvailabilityModal from "./RoomAvailabilityModal";

export default function RegisterReservationView() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [contractId, setContractId] = useState("");
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomAssignments, setRoomAssignments] = useState({});
  const [currentRoomIndex, setCurrentRoomIndex] = useState(null);
  const [allGuests, setAllGuests] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [companyContracts, setCompanyContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [companySearch, setCompanySearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    async function loadGuests() {
      try {
        const data = await getAllGuests();
        setAllGuests(data);
      } catch (e) {
        console.error(e);
      }
    }
    loadGuests();
  }, []);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const data = await getAllCompanies();
        setAllCompanies(data);
      } catch (e) {
        console.error(e);
      }
    }
    loadCompanies();
  }, []);

  useEffect(() => {
    async function loadCompanyContracts() {
      if (!companyId) {
        setCompanyContracts([]);
        setFilteredContracts([]);
        setContractId("");
        setSelectedContract(null);
        return;
      }
      
      try {
        const contracts = await getCompanyContracts(companyId);
        setCompanyContracts(contracts);
        
        if (startDate && endDate) {
          const filtered = contracts.filter(contract => {
            const contractStart = new Date(contract.start_date);
            const contractEnd = new Date(contract.end_date);
            const reservationStart = new Date(startDate);
            const reservationEnd = new Date(endDate);
            
            return reservationStart >= contractStart && reservationEnd <= contractEnd;
          });
          setFilteredContracts(filtered);
        } else {
          setFilteredContracts(contracts);
        }
      } catch (e) {
        console.error(e);
        setError(e.message);
      }
    }
    loadCompanyContracts();
  }, [companyId, startDate, endDate]);

  useEffect(() => {
    // Cuando se selecciona un contrato, obtener el contrato completo con sus habitaciones
    if (contractId) {
      const contract = filteredContracts.find(c => c.id === contractId);
      setSelectedContract(contract || null);
    } else {
      setSelectedContract(null);
    }
  }, [contractId, filteredContracts]);

  const handleOpenRooms = () => {
    if (!startDate || !endDate) {
      setError("Debe seleccionar rango de fechas antes de buscar habitaciones.");
      return;
    }
    if (!selectedContract) {
      setError("Debe seleccionar un contrato antes de buscar habitaciones.");
      return;
    }
    setError(null);
    setModalOpen(true);
  };

  const handleSelectRooms = (roomObjects) => {
    const newRooms = [...selectedRooms, ...roomObjects];
    setSelectedRooms(newRooms);
    
    const newAssignments = { ...roomAssignments };
    roomObjects.forEach(room => {
      newAssignments[room.id] = [];
    });
    setRoomAssignments(newAssignments);
    
    if (selectedRooms.length === 0 && roomObjects.length > 0) {
      setCurrentRoomIndex(0);
    }
  };

  const handleRemoveRoom = (roomId) => {
    setSelectedRooms(prev => prev.filter(r => r.id !== roomId));
    setRoomAssignments(prev => {
      const newAssignments = { ...prev };
      delete newAssignments[roomId];
      return newAssignments;
    });
    
    if (currentRoomIndex !== null) {
      const remainingRooms = selectedRooms.filter(r => r.id !== roomId);
      if (remainingRooms.length === 0) {
        setCurrentRoomIndex(null);
      } else if (currentRoomIndex >= remainingRooms.length) {
        setCurrentRoomIndex(remainingRooms.length - 1);
      }
    }
  };

  const handleAddGuestToRoom = async (guestData) => {
    if (currentRoomIndex === null) return;
    
    const currentRoom = selectedRooms[currentRoomIndex];
    const currentGuests = roomAssignments[currentRoom.id] || [];
    
    if (currentGuests.length >= 2) {
      setError("Máximo 2 personas por habitación.");
      return;
    }
    
    if (currentGuests.length > 0) {
      const existingGender = currentGuests[0].gender;
      if (existingGender !== guestData.gender) {
        setError("Todos los huéspedes en una habitación deben ser del mismo sexo.");
        return;
      }
    }
    
    let guestToAdd = guestData;
    
    if (!guestData.id) {
      try {
        guestToAdd = await createGuest(guestData);
      } catch (e) {
        console.error(e);
        setError(e.message);
        return;
      }
    }
    
    const isAlreadyAssigned = Object.values(roomAssignments).some(
      guests => guests.some(g => g.id === guestToAdd.id)
    );
    
    if (isAlreadyAssigned) {
      setError("Este huésped ya está asignado a otra habitación.");
      return;
    }
    
    setRoomAssignments(prev => ({
      ...prev,
      [currentRoom.id]: [...currentGuests, guestToAdd]
    }));
    setError(null);
  };

  const handleRemoveGuestFromRoom = (guestId) => {
    if (currentRoomIndex === null) return;
    
    const currentRoom = selectedRooms[currentRoomIndex];
    setRoomAssignments(prev => ({
      ...prev,
      [currentRoom.id]: prev[currentRoom.id].filter(g => g.id !== guestId)
    }));
  };

  const handleConfirmRoomAssignment = () => {
    if (currentRoomIndex === null) return;
    
    const currentRoom = selectedRooms[currentRoomIndex];
    const currentGuests = roomAssignments[currentRoom.id] || [];
    
    if (currentGuests.length === 0) {
      setError("Debe asignar al menos 1 huésped a la habitación antes de continuar.");
      return;
    }
    
    if (currentRoomIndex < selectedRooms.length - 1) {
      setCurrentRoomIndex(currentRoomIndex + 1);
    } else {
      setCurrentRoomIndex(null);
    }
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    
    const incompleteRooms = selectedRooms.filter(room => {
      const guests = roomAssignments[room.id] || [];
      return guests.length === 0;
    });
    
    if (incompleteRooms.length > 0) {
      setError("Todas las habitaciones deben tener al menos 1 huésped asignado.");
      return;
    }
    
    if (!companyId) {
      setError("Debe seleccionar una empresa.");
      return;
    }
    
    if (!contractId) {
      setError("Debe seleccionar un contrato.");
      return;
    }
    
    try {
      setLoading(true);
      const allGuests = Object.values(roomAssignments).flat();
      
      const newReservation = await createReservation({
        company_id: companyId,
        contract_id: contractId,
        start_date: startDate,
        end_date: endDate,
        guest_count: allGuests.length,
        room_ids: selectedRooms.map((r) => r.id),
      });

      const guestIds = allGuests.map((g) => g.id);
      if (guestIds.length > 0) {
        await assignGuestsToReservation(newReservation.id, guestIds);
      }


      for (const roomId of Object.keys(roomAssignments)) {
        const guestsInRoom = roomAssignments[roomId] || [];
        for (const guest of guestsInRoom) {
          await createRoomAssignment(newReservation.id, roomId, guest.id);
        }
      }
      
      setSuccessMsg("Reserva registrada con éxito.");
      setStartDate("");
      setEndDate("");
      setSelectedRooms([]);
      setRoomAssignments({});
      setCurrentRoomIndex(null);
      setCompanyId("");
      setContractId("");
      setSelectedContract(null);
      setCompanyContracts([]);
      setFilteredContracts([]);
      setCompanySearch("");
    } catch (e) {
      console.error(e);
      const errorMessage = e.message;
      if (errorMessage === "Room already has an active reservation with overlapping dates") {
        setError("La habitación ya tiene una reserva activa con fechas que se superponen.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, label: "Empresa", done: !!companyId },
    { id: 2, label: "Fechas", done: !!startDate && !!endDate },
    { id: 3, label: "Contrato", done: !!contractId },
    { id: 4, label: "Habitaciones", done: selectedRooms.length > 0 },
    { id: 5, label: "Asignación", done: selectedRooms.length > 0 && Object.values(roomAssignments).every(g => g.length > 0) },
    { id: 6, label: "Confirmar", done: false },
  ];

  const currentRoom = currentRoomIndex !== null ? selectedRooms[currentRoomIndex] : null;
  const currentRoomGuests = currentRoom ? (roomAssignments[currentRoom.id] || []) : [];

  const filteredCompanies = allCompanies.filter(company =>
    company.name.toLowerCase().includes(companySearch.toLowerCase()) ||
    company.nit.toLowerCase().includes(companySearch.toLowerCase()) ||
    company.id.toLowerCase().includes(companySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ── ENCABEZADO ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900 tracking-tight">
              Nueva reserva
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Complete los pasos para registrar la reserva
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-1">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step.done
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {step.done ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.id}
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 w-6 rounded ${step.done ? "bg-emerald-400" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── PASO 1: EMPRESA ── */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 border-b border-gray-100 bg-emerald-50/50 px-5 py-3.5">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold ${companyId ? "bg-emerald-600" : "bg-gray-400"}`}>
              1
            </div>
            <h2 className="font-semibold text-emerald-900 text-sm">Empresa</h2>
            {companyId && (
              <span className="ml-auto text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                Seleccionada
              </span>
            )}
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Buscar empresa (nombre, NIT o ID)
              </label>
              <input
                type="text"
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                placeholder="Ingrese nombre, NIT o ID de empresa"
              />
            </div>
            
            {companySearch && filteredCompanies.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {filteredCompanies.map(company => (
                  <button
                    key={company.id}
                    onClick={() => {
                      setCompanyId(company.id);
                      setCompanySearch(company.name);
                      setContractId("");
                      setSelectedContract(null);
                    }}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                      companyId === company.id
                        ? "bg-emerald-100 text-emerald-900 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="font-medium">{company.name}</div>
                    <div className="text-xs text-gray-500">NIT: {company.nit}</div>
                  </button>
                ))}
              </div>
            )}
            
            {companySearch && filteredCompanies.length === 0 && (
              <p className="text-xs text-gray-500">No se encontraron empresas.</p>
            )}
          </div>
        </div>

        {/* ── PASO 2: FECHAS ── */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 border-b border-gray-100 bg-emerald-50/50 px-5 py-3.5">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold ${startDate && endDate ? "bg-emerald-600" : "bg-gray-400"}`}>
              2
            </div>
            <h2 className="font-semibold text-emerald-900 text-sm">Rango de fechas</h2>
            {startDate && endDate && (
              <span className="ml-auto text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                {startDate} → {endDate}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Fecha de ingreso
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setError(null); }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Fecha de salida
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setError(null); }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                required
              />
            </div>
          </div>
        </div>

        {/* ── PASO 3: CONTRATO ── */}
        {companyId && startDate && endDate && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-gray-100 bg-emerald-50/50 px-5 py-3.5">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold ${contractId ? "bg-emerald-600" : "bg-gray-400"}`}>
                3
              </div>
              <h2 className="font-semibold text-emerald-900 text-sm">Contrato</h2>
              {contractId && (
                <span className="ml-auto text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                  Seleccionado
                </span>
              )}
            </div>
            <div className="p-5 space-y-4">
              {filteredContracts.length > 0 ? (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Contrato activo
                  </label>
                  <select
                    value={contractId}
                    onChange={(e) => setContractId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                  >
                    <option value="">Seleccione un contrato</option>
                    {filteredContracts.map(contract => (
                      <option key={contract.id} value={contract.id}>
                        Contrato #{contract.contract_number} - {contract.start_date} a {contract.end_date} ({contract.rooms.length} habitaciones)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-xs text-red-600 font-medium">
                  No hay contratos activos que coincidan con las fechas seleccionadas. Debe haber un contrato para poder realizar la reserva.
                </p>
              )}
              
              {selectedContract && selectedContract.rooms.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Habitaciones del contrato:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedContract.rooms.map(room => (
                      <span
                        key={room.id}
                        className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full"
                      >
                        Hab. {room.room_number}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PASO 4: HABITACIONES ── */}
        {selectedContract && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-gray-100 bg-emerald-50/50 px-5 py-3.5">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold ${selectedRooms.length > 0 ? "bg-emerald-600" : "bg-gray-400"}`}>
                4
              </div>
              <h2 className="font-semibold text-emerald-900 text-sm">Habitaciones</h2>
              {selectedRooms.length > 0 && (
                <span className="ml-auto text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                  {selectedRooms.length} seleccionada{selectedRooms.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="p-5 space-y-4">
              <button
                onClick={handleOpenRooms}
                disabled={currentRoomIndex !== null}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar habitaciones disponibles del contrato
              </button>

              {selectedRooms.length > 0 && (
                <div className="space-y-3">
                  {selectedRooms.map((room, index) => {
                    const roomGuests = roomAssignments[room.id] || [];
                    const isCurrentRoom = currentRoomIndex === index;
                    const isCompleted = roomGuests.length > 0;
                    
                    return (
                      <div
                        key={room.id}
                        className={`rounded-xl border p-4 ${
                          isCurrentRoom
                            ? "border-emerald-400 bg-emerald-50"
                            : isCompleted
                            ? "border-emerald-200 bg-emerald-50/50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              isCompleted ? "bg-emerald-600 text-white" : "bg-gray-300 text-gray-600"
                            }`}>
                              {isCompleted ? "✓" : index + 1}
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-emerald-900">
                                Hab. {room.room_number}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                Cap. {room.capacity} · {roomGuests.length}/2 huéspedes
                              </span>
                            </div>
                          </div>
                          {!isCompleted && currentRoomIndex === null && (
                            <button
                              onClick={() => setCurrentRoomIndex(index)}
                              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              Asignar huéspedes
                            </button>
                          )}
                          {isCompleted && !isCurrentRoom && (
                            <button
                              onClick={() => handleRemoveRoom(room.id)}
                              className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                        
                        {isCompleted && (
                          <div className="flex flex-wrap gap-2">
                            {roomGuests.map(guest => (
                              <span
                                key={guest.id}
                                className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full"
                              >
                                {guest.first_name} {guest.last_name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ASIGNACIÓN DE HUÉSPEDES A HABITACIÓN ACTUAL ── */}
        {currentRoom && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-emerald-200 bg-emerald-100 px-5 py-3.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                5
              </div>
              <h2 className="font-semibold text-emerald-900 text-sm">
                Asignar huéspedes a Hab. {currentRoom.room_number}
              </h2>
              <span className="ml-auto text-xs text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded-full font-medium">
                {currentRoomGuests.length}/2
              </span>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-600">
                Asigne 1 o 2 huéspedes. Todos deben ser del mismo sexo.
              </p>
              
              <GuestSearchCreate
                allGuests={allGuests}
                onAddGuest={handleAddGuestToRoom}
                selectedGuests={currentRoomGuests}
                onRemoveGuest={handleRemoveGuestFromRoom}
                companyId={companyId}
              />
              
              {currentRoomGuests.length > 0 && (
                <button
                  onClick={handleConfirmRoomAssignment}
                  className="w-full rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  Confirmar asignación y continuar
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── ERRORES / ÉXITO ── */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <svg className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <svg className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-emerald-700 font-medium">{successMsg}</p>
          </div>
        )}

        {/* ── BOTÓN REGISTRAR ── */}
        {selectedRooms.length > 0 && Object.values(roomAssignments).every(g => g.length > 0) && currentRoomIndex === null && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-800 px-6 py-4 text-white font-bold text-base tracking-wide hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Registrando…
              </span>
            ) : (
              "Registrar reserva"
            )}
          </button>
        )}
      </div>

      <RoomAvailabilityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        startDate={startDate}
        endDate={endDate}
        onSelectRooms={handleSelectRooms}
        contractRooms={selectedContract?.rooms || []}
      />
    </div>
  );
}